time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
notify          = require 'app/controllers/notify'
string_utils = require 'app/utils/string'
ProgressDragger = require 'app/utils/progress_dragger'
normalize_info = require 'app/utils/rooms/normalize_info'
login_popup = require 'app/utils/login_popup'

module.exports = class Player
  is_playing: false
  loading_visible: false
  like_lock: false
  is_recorded: false
  last_time: ""
  data_rooms: {}
  is_dragging: false
  last_audio_started: null
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
    # @dragger.on 'click', @on_progress_click
    @play_btn.on 'click', @on_play_clicked
    @like_btn.on 'click', @on_like_clicked
    @progress_parent.find('.hitarea').on app.settings.events_map.up, @on_progress_click
    @dom.find( '.open_fullscreen' ).on 'click', @open_fullscreen
    @dom.find( '.close_fullscreen' ).on 'click', @close_fullscreen
    view.on 'binded', @on_views_binded

    app.window.on 'resize', @on_resize

    # Play / Pause set when pressing SPACE
    $( window ).bind 'keypress', ( e ) =>

      # don't do anything if on input
      return true if e.target.nodeName is "INPUT"
      return true if e.target.nodeName is "TEXTAREA"

      # hit the space bar?
      if e.keyCode is 32
        @play_btn.click()

        # try to prevent event
        return false

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

    if not user.is_logged()
      app.settings.after_login_url = location.pathname
      app.settings.action = 
        type: "like"
        room_id: @data.data._id
        is_live: @data.data.is_live

      return login_popup()


    return false if @like_lock

    @like_lock = true

    if @like_btn.hasClass 'liked'
      @unlike()
    else
      @like()

    return false

  unlike: ->
    type = if @data.data.is_live then 'rooms' else 'tapes'
    api[type].dislike @data.data._id, (error, response) =>
      # log "[Player] dislike", error, response
      @like_lock = false
      
      if error
        notify.error "There was an error. Please try later."
        return
        
      @like_btn.removeClass 'liked'

  like: ->
    type = if @data.data.is_live then 'rooms' else 'tapes'
    api[type].like @data.data._id, (error, response) =>
      # log "[Player] like", error, response
      @like_lock = false

      if error
        notify.error "There was an error. Please try later."
        return
      @like_btn.addClass 'liked'


  on_loaded: ( duration ) =>
    if duration > 0
      time = time_to_string( parseInt( duration ) )
      # log "[Player] on_loaded", duration, time
      @time_tot.html time.str

  on_play_clicked: =>
    @audio.toggle()
    return false

  get_audio_data : (data) ->
    audio_data = {}

    
    obj = data.data
    
    audio_data = 
      id         : obj._id
      is_recorded: !obj.is_live
      start_time : obj.started_at
      src        : obj.url
      
    # log "[Get audio data]", data, audio_data

    return audio_data


  # general method for playing both tape and room audio
  general_play: ( room_id, source_src, is_tape ) ->
    if is_tape
      @play room_id, source_src
    else
      @play_live room_id, source_src


  # shortcut for playing live rooms
  play_live: (room_id, src = null) ->
    @play room_id, src, true

  ###
  Check if the room/tape information from room_id has been loaded.
  If it's not, fetch the info and the call _play()
  Otherwise, just call _play()
  ###
  play: (room_id, src = null, is_live = false) ->

    if @current_room_id is room_id
      return if @audio.is_playing
      # log "[Player.play()] the audio is the same. Simply start playing."
      return @on_play_clicked()


    if not @data_rooms[ room_id ]?
      # log "[Player.play()] no data for this audio. Fetching it..."
      @fetch_room room_id, is_live, => @_play room_id

    else
      # log "[Player.play()] got data for this audio. Just play!"
      @_play room_id


    # For mobile, we gonna play the src straight away,
    # as the click action must be directly connected to the 
    # audio play method. We gonna load the room info as a parallel
    # thread.
    if app.settings.browser.mobile and src?
      @audio.mobile_play src


  ###
  This is the actual play method who updates the UI and play 
  the audio element.
  ###
  _play: ( room_id ) ->
    @last_audio_started = null
    @current_room_id = room_id

    @open()

    # Choose the righth api to call
    type = if @data_rooms[ room_id ].data.is_live then 'rooms' else 'tapes'

    # update stats
    api[ type ].play room_id, (error, response) ->

    @data = @data_rooms[ room_id ]


    # log "[Player._play()]", @data
    @update_info @data
    @audio.set_data @get_audio_data( @data )

    @reset_progress()
    
  fetch_room: ( room_id, is_live, callback ) ->

    app.emit 'audio:loading', room_id

    kallback = callback

    if @data_rooms[ room_id ]?
      kallback?()
    else

      return if @requested_rooms[ room_id ]?

      @requested_rooms[ room_id ] = true

      on_response = (error, response) => 
        if response

          @data_rooms[ room_id ] = normalize_info response, is_live
          kallback?()
        else
          @requested_rooms[ room_id ] = null
          @on_error()

      if is_live
        # log "[Player] fetching LIVE info. api.rooms.info", room_id
        api.rooms.info room_id, on_response
      else
        # log "[Player] fetching TAPE info. api.tapes.get", room_id
        api.tapes.get room_id, on_response

  on_error: ->
    notify.error 'There was an error.'
    app.emit 'audio:paused'
    
  stop: ->
    @audio.pause()

  on_room_offline: ->
    @stop()
    if @dom.hasClass 'is_live'
      @dom.removeClass 'is_live'

  on_room_live: ->
    @dom.addClass 'is_live'
  

  update_info: ( data ) ->

    obj = data.data
    # log "[Update info]", obj

    if obj.is_live
      room_link = "/#{obj.user.info.username}/#{obj.slug}"
    else
      room_link = "/#{obj.user.info.username}/r/#{obj.slug}"

    @thumb.attr 'src', transform.player_thumb obj.cover_url
    title = string_utils.cut_text obj.title, 36
    @title.html title
    @author.html "By " + obj.user.info.name

    @author.attr 'title', obj.user.info.name
    @title.attr 'title', obj.title

    @author.attr 'href',  "/" + obj.user.info.username


    @title.attr 'href', room_link

    @thumb.parent().attr 'href', room_link
    @thumb.parent().attr 'title', obj.title

    @share.update_with_data
      link: room_link
      title: obj.title
      summary: obj.about
      image: obj.cover_url

    # @share.update_link

    if obj.is_live
      @dom.addClass 'is_live'
    else
      @dom.removeClass 'is_live'

    if obj.liked
      @like_btn.addClass 'liked'
    else
      @like_btn.removeClass 'liked'

    # Show the follow popup
    @follow_popup.hide()

    clearTimeout @timeout_follow_popup
    @timeout_follow_popup = setTimeout =>
      # log "[Player] checking popup", @audio.is_playing
      if @audio.is_playing
        @follow_popup.show obj
    , 30000

  on_audio_started: =>  

    # return if @last_audio_started is @data.data._id
  
    # if not @data?
    #   log "[Player] on_audio_started. no data. then stop", @data
    #   notify.error 'There was an error.'
    #   @stop()
    #   return

    # log "[Player] on_audio_started", @data
      

    @play_btn.addClass( 'ss-pause' ).removeClass( 'ss-play' )


    # @loading.fadeOut()
    # log "[Player] loading hide"
    @hide_loading()

    if @data?
      @last_audio_started = @data.data._id 
      app.emit 'audio:started', @data.data._id

  on_audio_stopped: =>
    # log "[Player] on_audio_stopped"
    @last_audio_started = null
    @play_btn.removeClass( 'ss-pause' ).addClass( 'ss-play' )

    # @progress.css 'width', '0%'
    # @time.html "00:00:00"

    if @data?
      app.emit 'audio:paused', @data.data._id

  on_audio_ended: =>
    # log "[Player] on_audio_ended"
    
    app.emit 'audio:ended', @data.data._id    
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

  on_snapped: =>
    # log "[Player] loading hide"
    @hide_loading()

  on_progress: (data) =>
    return if @is_dragging

    @hide_loading()
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
    # log "[xxx] dragging", perc
    # log "[Player] on_progress_ended() perc", perc
    # @dom.addClass 'loading'
    # @audio.snap_to perc/100


    delay 10, =>
      @is_dragging = false


  on_progress_click: (e) =>
    # log "[Player] on_progress_click() at first"
    return if not @audio.data.is_recorded

    x = if e.offsetX? then e.offsetX else e.originalEvent.layerX
    w = $(e.currentTarget).width()
    perc = x / w
    # log "[Player] on_progress_click()", e, "offset", x, "w", w, "%", perc
    @show_loading()
    @audio.snap_to perc

  close: ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: =>
    app.body.addClass 'player_visible'
    # log "[Player] open() loading show"
    @dom.show()
    @show_loading()
    delay 1, => @dom.addClass 'visible'

  show_loading: ->
    if not @loading_visible
      @dom.addClass 'loading'
      @loading_visible = true

  hide_loading: ->
    if @loading_visible
      @dom.removeClass 'loading'
      @loading_visible = false

  open_fullscreen: =>
    @dom.addClass 'fullscreen'

  close_fullscreen: =>
    @dom.removeClass 'fullscreen'