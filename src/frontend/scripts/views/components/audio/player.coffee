time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
notify          = require 'app/controllers/notify'

moment = require 'moment'

module.exports = class Player
  is_playing: false
  like_lock: false
  is_recorded: false
  last_time: ""
  data_rooms: {}
  ### 
  the map of the ids of the rooms requested (even not loaded).
  This is used to avoid multiple calls at the same time
  ###
  requested_rooms: {} 
  current_room_id: null

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
    # @loading = @dom.find '.loading_screen'

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

    if data.room.info.file
      audio_data = 
        id: data.room._id
        is_recorded: true
        start_time: moment()
        src: data.room.info.file

    else
      audio_data = 
        id: data.room._id
        is_recorded: false
        start_time: data.room.status.live.started_at
        src: data.room.info.url

    return audio_data

    
  play: (room_id, src = null) ->
    log "[Player] play", room_id
    if not room_id? and @current_room_id
      room_id = @current_room_id

    if not @data_rooms[ room_id ]?
      @fetch_room room_id, => @_play room_id
    else
      @_play room_id

    if src?
      log "[Player] src is set", src
      @audio.set_src src
      @audio.play()

    
  fetch_room: ( room_id, callback ) ->
    if @data_rooms[ room_id ]?
      callback()
    else

      return if @requested_rooms[ room_id ]?

      @requested_rooms[ room_id ] = true

      log "[Player] no informations. fetching...", room_id
      api.rooms.info room_id, (error, response) => 

        log '[Player] room info', response
        @data_rooms[ room_id ] = response
        callback()


  _play: ( room_id ) ->
    @current_room_id = room_id

    @open()

    # Call the api for stats
    api.rooms.play room_id, (error, response) ->

    @data = @data_rooms[ room_id ]

    log "[Player] _play", @data


    @update_info @data
    @audio.set_data @get_audio_data( @data )
    @audio.play()

  stop: ->
    @audio.pause()


  update_info: ( data ) ->

    log "[Player] update_info", data

    if data.room.status.is_live
      room_link = "/#{data.user.info.username}/#{data.room.info.slug}"
    else
      room_link = "/#{data.user.info.username}"

    @thumb.attr 'src', transform.player_thumb data.room.info.cover_url
    @title.html data.room.info.title
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

  on_audio_started: =>    
    log "[Player] on_audio_started"

    @play_btn.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    app.emit 'audio:started', @data.room._id

    # @loading.fadeOut()
    @dom.removeClass 'loading'
    log "[Player] loading hide"

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
    @dom.removeClass 'loading'
    log "[Player] loading hide"

  on_progress: (data) =>
    @time.html data.time.str
    @progress.css 'width', data.perc + '%'

  on_progress_click: (e) =>

    return if not @audio.data.is_recorded
    x = e.offsetX
    w = @progress_parent.width()
    perc = x / w

    @dom.addClass 'loading'
    log "[Player] loading show"
    @audio.snap_to perc

    return false

  close: ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: =>
    app.body.addClass 'player_visible'
    @dom.show().addClass( 'loading' )
    log "[Player] loading show"
    delay 1, => @dom.addClass 'visible'



  open_fullscreen: =>
    @dom.addClass 'fullscreen'

  close_fullscreen: =>
    @dom.removeClass 'fullscreen'