time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
notify          = require 'app/controllers/notify'
string_utils = require 'app/utils/string'
ProgressDragger = require 'app/utils/progress_dragger'

moment = require 'moment'

module.exports = class Player
  is_playing: false
  like_lock: false
  is_recorded: false
  last_time: ""
  data_rooms: {}
  is_dragging: false
  ### 
  the map of the ids of the rooms requested (even not loaded).
  This is used to avoid multiple calls at the same time
  ###
  requested_rooms: {} 
  current_room_id: null
  timeout_follow_popup: null


  constructor: ( @dom ) ->
    @thumb    = @dom.find '.player_icon img'
    @title    = @dom.find '.player_title'
    @author   = @dom.find '.player_author'
    @time     = @dom.find '.player_time'
    @time_tot = @dom.find '.player_total_time'
    @play_btn = @dom.find '.ss-play'
    @like_btn = @dom.find '.ss-heart'
    @progress = @dom.find '.player_progress span'
    @progress_parent = @dom.find '.player_progress'

    @dragger = new ProgressDragger @progress_parent 
    @dragger.on 'drag', @on_progress_dragger
    @dragger.on 'drag:started', @on_progress_started
    @dragger.on 'drag:ended', @on_progress_ended

    @play_btn.on 'click', @on_play_clicked
    @like_btn.on 'click', @on_like_clicked
    @progress_parent.on 'click', @on_progress_click
    @dom.find( '.open_fullscreen' ).on 'click', @open_fullscreen
    @dom.find( '.close_fullscreen' ).on 'click', @close_fullscreen
    view.on 'binded', @on_views_binded

    app.window.on 'resize', @on_resize

  on_resize: =>
    @close_fullscreen()

  on_views_binded: (scope) =>
    return if not scope.main

    @share = view.get_by_dom @dom.find( '.share_wrapper' )
    @audio = view.get_by_dom @dom.find( 'audio' )
    @follow_popup = view.get_by_dom @dom.find '.follow_player_popup'
    @audio.on 'started', @on_audio_started
    @audio.on 'paused', @on_audio_stopped
    @audio.on 'ended', @on_audio_ended
    @audio.on 'progress', @on_progress
    @audio.on 'snapped', @on_snapped
    @audio.on 'loaded', @on_loaded
    view.off 'binded', @on_views_binded
    
  on_like_clicked: =>
    return false if @like_lock

    @like_lock = true

    if @like_btn.hasClass 'liked'
      @unlike()
    else
      @like()

    return false

  unlike: ->
    api.rooms.dislike @data.room._id, (error, response) =>
      log "[Player] dislike", error, response
      @like_lock = false
      
      if error
        notify.error "There was an error. Please try later."
        return
        
      @like_btn.removeClass 'liked'

  like: ->
    api.rooms.like @data.room._id, (error, response) =>
      log "[Player] like", error, response
      @like_lock = false

      if error
        notify.error "There was an error. Please try later."
        return
      @like_btn.addClass 'liked'


  on_loaded: ( duration ) =>
    if duration > 0
      time = time_to_string( parseInt( duration ) )
      log "[Player] on_loaded", duration, time
      @time_tot.html time.str

  on_play_clicked: =>
    @audio.toggle()
    return false

  get_audio_data : (data) ->
    audio_data = {}

    if data.room.status.is_live
      audio_data = 
        id         : data.room._id
        is_recorded: false
        start_time : data.room.status.live.started_at
        src        : data.room.info.url

    else
      audio_data = 
        id: data.room._id
        is_recorded: true
        start_time: moment()
        src: data.room.info.file
      

    return audio_data

    
  play: (room_id, src = null) ->

    log "[Player] play", room_id

    if not room_id? and @current_room_id
      room_id = @current_room_id 
    else if @current_room_id is room_id and @audio.is_playing
      log "[Player] returning. already playing this room"
      return false

    if not @data_rooms[ room_id ]?
      @fetch_room room_id, => @_play room_id

    else
      @_play room_id

      if src?
        @audio.set_src src

      @audio.play()

    if src?
      log "[Player] src is set", src
      @audio.set_src src
      @audio.play()

    
  fetch_room: ( room_id, callback ) ->
    log "[Player] fetch_room", room_id, @data_rooms[ room_id ]
    if @data_rooms[ room_id ]?
      log "[Player] fetch_room. data_rooms available", @data_rooms[ room_id ]
      callback()
    else

      return if @requested_rooms[ room_id ]?

      @requested_rooms[ room_id ] = true

      log "[Player] no informations. fetching...", room_id
      api.rooms.info room_id, (error, response) => 
        if response
          log '[Player] room info', response
          @data_rooms[ room_id ] = response
          callback()
        else
          @requested_rooms[ room_id ] = null
          @on_error()

  on_error: ->
    notify.error 'There was an error.'
    app.emit 'audio:paused'



  _play: ( room_id ) ->
    @current_room_id = room_id

    @open()

    # Call the api for stats
    api.rooms.play room_id, (error, response) ->

    @data = @data_rooms[ room_id ]

    log "[Player] _play", @data


    @update_info @data
    @audio.set_data @get_audio_data( @data )

    @reset_progress()
    
  stop: ->
    @audio.pause()


  update_info: ( data ) ->

    log "[Player] update_info", data

    if data.room.status.is_live
      room_link = "/#{data.user.info.username}/#{data.room.info.slug}"
    else
      room_link = "/#{data.user.info.username}"

    @thumb.attr 'src', transform.player_thumb data.room.info.cover_url
    title = string_utils.cut_text data.room.info.title, 36
    @title.html title
    @author.html "By " + data.user.info.name

    @author.attr 'title', data.user.info.name
    @title.attr 'title', data.room.info.title

    @author.attr 'href',  "/" + data.user.info.username


    @title.attr 'href', room_link

    # @thumb.parent().attr 'href', room_link
    @thumb.parent().attr 'title', data.room.info.title

    @share.update_with_data
      link: room_link
      title: data.room.info.title
      summary: data.room.info.about
      image: data.room.info.cover_url

    @share.update_link 

    if data.room.status.is_live
      @dom.addClass 'is_live'
    else
      @dom.removeClass 'is_live'

    if data.liked
      @like_btn.addClass 'liked'
    else
      @like_btn.removeClass 'liked'

    # Show the follow popup
    @follow_popup.hide()

    clearTimeout @timeout_follow_popup
    @timeout_follow_popup = setTimeout =>
      @follow_popup.show data
    , 30000

  on_audio_started: =>    
    log "[Player] on_audio_started", @data

    @play_btn.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    app.emit 'audio:started', @data.room._id

    # @loading.fadeOut()
    log "[Player] loading hide"
    @dom.removeClass 'loading'

  on_audio_stopped: =>
    log "[Player] on_audio_stopped"

    @play_btn.removeClass( 'ss-pause' ).addClass( 'ss-play' )

    # @progress.css 'width', '0%'
    # @time.html "00:00:00"

    app.emit 'audio:paused', @data.room._id

  on_audio_ended: =>
    log "[Player] on_audio_ended"

    @on_audio_stopped()
    
    # Snap back the progress bar
    @reset_progress()

  reset_progress: ->
    @progress.hide()
    delay 1, =>

      @on_progress
        perc: 0.0
        time: str: "00:00:00"

    delay 100, => @progress.show()

  on_snapped: ->
    log "[Player] loading hide"
    @dom.removeClass 'loading'

  on_progress: (data) =>
    return if @is_dragging
    @time.html data.time.str
    @progress.css 'width', data.perc + '%'

  on_progress_dragger: ( perc ) =>
    @progress.css 'width', perc + '%'
    time = @audio.get_time_from_perc( perc / 100 )
    @time.html time.str


  on_progress_started: =>
    @progress.addClass 'dragging'
    @is_dragging = true

  on_progress_ended: (perc) =>
    @progress.removeClass 'dragging'
    log "[Player] on_progress_ended() loading show"
    @dom.addClass 'loading'
    @audio.snap_to perc/100
    @is_dragging = false


  on_progress_click: (e) =>

    return if not @audio.data.is_recorded
    x = e.offsetX
    w = $(e.currentTarget).width()
    perc = x / w

    log "[Player] on_progress_click() loading show"
    @dom.addClass 'loading'
    @audio.snap_to perc

    return false

  close: ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: =>
    app.body.addClass 'player_visible'
    log "[Player] open() loading show"
    @dom.show().addClass( 'loading' )
    delay 1, => @dom.addClass 'visible'



  open_fullscreen: =>
    @dom.addClass 'fullscreen'

  close_fullscreen: =>
    @dom.removeClass 'fullscreen'