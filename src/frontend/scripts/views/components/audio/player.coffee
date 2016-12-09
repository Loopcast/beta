time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
notify          = require 'app/controllers/notify'
string_utils = require 'app/utils/string'
ProgressDragger = require 'app/utils/progress_dragger'
normalize_info = require 'app/utils/rooms/normalize_info'
login_popup = require 'app/utils/login_popup'
radiokit = require 'radiokit-toolkit-playback'

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
    @thumb           = @dom.find '.player_icon img'
    @title           = @dom.find '.player_title'
    @author          = @dom.find '.player_author'
    @time            = @dom.find '.player_time'
    @time_tot        = @dom.find '.player_total_time'
    @like_btn        = @dom.find '.ss-heart'
    @progress        = @dom.find '.player_progress span'
    @track_artist    = @dom.find '.track_artist'
    @track_separator = @dom.find '.track_separator'
    @track_title     = @dom.find '.track_title'
    @progress_parent = @dom.find '.player_progress'
    @itunes_button   = @dom.find '.track_itunes'

    #@dragger = new ProgressDragger @progress_parent
    #@dragger.on 'drag', @on_progress_dragger
    #@dragger.on 'drag:started', @on_progress_started
    #@dragger.on 'drag:ended', @on_progress_ended
    # @dragger.on 'click', @on_progress_click
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

      @on_play_clicked()

  on_resize: =>
    @close_fullscreen()

  on_views_binded: (scope) =>
    return if not scope.main

    @share = view.get_by_dom @dom.find( '.share_wrapper' )
    @audio = view.get_by_dom @dom.find( 'audio' )
    @follow_popup = view.get_by_dom @dom.find '.follow_player_popup'
    #@audio.on 'started', @on_audio_started
    #@audio.on 'paused', @on_audio_stopped
    #@audio.on 'ended', @on_audio_ended
    #@audio.on 'progress', @on_progress
    #@audio.on 'snapped', @on_snapped
    #@audio.on 'loaded', @on_loaded
    view.off 'binded', @on_views_binded

    @dom.find( ".player_button.no_fullscreen" ).click @on_play_clicked

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

    if @radiokit_player.isStarted()
      @radiokit_player.stop()
      @show_play_button()
      console.log 'audio:paused due to on_play_clicked'
      console.log "@current_room_id", @current_room_id

      app.emit 'audio:paused', @current_room_id
    else
      console.log 'audio:loading due to on_play_clicked'
      console.log "@current_room_id ", @current_room_id

      app.emit 'audio:loading', @current_room_id
      @radiokit_player.start()
      @show_loading()

    #@audio.toggle()
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
  general_play: ( room_id, radiokit_channel_id ) ->
    @play(room_id, radiokit_channel_id)


  ###
  Check if the room/tape information from room_id has been loaded.
  If it's not, fetch the info and the call _play()
  Otherwise, just call _play()
  ###
  play: (room_id, radiokit_channel_id) ->
    if @current_room_id is room_id
      @stop()

      return

    @initialize_player(radiokit_channel_id)

    @radiokit_player.start()

    if not @data_rooms[ room_id ]?
      # log "[Player.play()] no data for this audio. Fetching it..."
      @fetch_room room_id, =>
        @_play room_id
    else
      # log "[Player.play()] got data for this audio. Just play!"
      @_play room_id


  ###
  This is the actual play method who updates the UI and play
  the audio element.
  ###
  _play: ( room_id ) ->
    @last_audio_started = null
    @current_room_id = room_id

    @open()
    @clearFileInfo()

    # update stats
    api[ 'rooms' ].play room_id, (error, response) ->

    @data = @data_rooms[ room_id ]


    # log "[Player._play()]", @data
    @update_info @data
    @audio.set_data @get_audio_data( @data )

    @reset_progress()

    #@radiokit_player.start()

  initialize_player: ( radiokit_channel_id ) =>
    if @radiokit_player
      try
        @radiokit_player.offAll()
        @radiokit_player.stop()
      catch e
        console.log "error stopping player on initialize_player"
        console.log e

    @radiokit_player = new radiokit.Channel.Player(
      radiokit_channel_id,
      '1:i23jsnduSD82jSjda7sndyasbj*ID2hdydhs'
    )
    @radiokit_player.on('track-playback-started', @onTrackPlaybackStarted)
    @radiokit_player.on('track-position', @onTrackPosition)
    @radiokit_player.on 'error-network', ->
      console.error 'radiokit network error'
      console.log arguments


  show_play_button: =>
    @is_playing = false
    @dom.find( ".fa-play-circle" ).show()
    @dom.find( ".fa-pause-circle" ).hide()
    @dom.find( ".fa-refresh" ).hide()

  show_pause_button: =>
    @is_playing = true
    @dom.find( ".fa-play-circle" ).hide()
    @dom.find( ".fa-pause-circle" ).show()
    @dom.find( ".fa-refresh" ).hide()


  show_loading: =>
    @dom.find( ".fa-play-circle" ).hide()
    @dom.find( ".fa-pause-circle" ).hide()
    @dom.find( ".fa-refresh" ).show()

  onTrackPlaybackStarted: (track) =>

    console.log "audio:started ->", @current_room_id

    app.emit "audio:started", @current_room_id
    @show_pause_button()

    @clearFileInfo()

    track.getInfoAsync()
      .then (info) =>
        metadata = info.getMetadata()
        affiliates = info.getAffiliates()

        if metadata.artist
          @track_artist.html metadata.artist
        if metadata.title
          @track_title.html metadata.title
        if metadata.artist and metadata.title
          @track_separator.html ' - '
        if affiliates.itunes
          @itunes_button.attr('href', affiliates.itunes.trackViewUrl + '&at=1000l5ZB')
          @itunes_button.css('display', 'block')


  onTrackPosition: (track, position, duration) =>
    @progress.css 'width', (position / duration * 100) + '%'
    @time.html @_humanTime(position)
    @time_tot.html "-" + @_humanTime(duration - position)

  _humanTime: (time) =>
    milliseconds = time % 1000

    secondsTotal = (time - milliseconds) / 1000
    seconds = secondsTotal % 60

    minutesTotal = (secondsTotal - seconds) / 60
    minutes = minutesTotal % 60

    @_padTwo(minutes) + ":" + @_padTwo(seconds)

  _padTwo: (number) =>
    if number < 10
      "0" + number
    else
      number

  clearFileInfo: () =>
    @track_artist.html ''
    @track_title.html ''
    @track_separator.html ''
    @itunes_button.attr('href', '#')
    @itunes_button.css('display', 'none')

  fetch_room: ( room_id, callback ) ->

    if not $( ".in_a_room" ).length
      console.log 'audio:loading room_id ->', room_id

      app.emit 'audio:loading', room_id

    if @data_rooms[ room_id ]?
      callback?()
    else

      return if @requested_rooms[ room_id ]?

      @requested_rooms[ room_id ] = true

      on_response = (error, response) =>
        if response
          @data_rooms[ room_id ] = normalize_info response
          callback?()
        else
          @requested_rooms[ room_id ] = null
          @on_error()

      api.rooms.info room_id, on_response

  on_error: ->
    console.log 'audio:pause due to error'
    notify.error 'There was an error.'
    app.emit 'audio:paused'

  stop: =>

    console.log 'audio:pause due to stop'
    app.emit "audio:paused", @current_room_id

    @show_play_button()
    #@current_room_id = null

    try
      @radiokit_player.offAll()
      @radiokit_player.stop()
    catch e
      console.log "error stopping player on initialize_player"
      console.log e

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
    @author.html 'By ' + obj.user.info.name

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

    # @loading.fadeOut()
    # log "[Player] loading hide"
    @hide_loading()

    if @data?
      @last_audio_started = @data.data._id

      console.log 'audio:started'
      app.emit 'audio:started', @current_room_id

  on_audio_stopped: =>
    # log "[Player] on_audio_stopped"
    @last_audio_started = null
    # @progress.css 'width', '0%'
    # @time.html "00:00:00"

    if @data?
      console.log 'audio:pause due to on_audio_stopped event'
      app.emit 'audio:paused', @data.data._id

  on_audio_ended: =>
    # log "[Player] on_audio_ended"

    console.log 'audio:ended'
    app.emit 'audio:ended', @data.data._id
    @on_audio_stopped()

    # Snap back the progress bar
    @reset_progress()

  reset_progress: ->
    @progress.hide()
    delay 1, =>

      @on_progress
        perc: 0.0
        time: str: "00:00"

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

  #show_loading: ->
    #if not @loading_visible
      #@dom.addClass 'loading'
      #@loading_visible = true

  hide_loading: ->
    if @loading_visible
      @dom.removeClass 'loading'
      @loading_visible = false

  open_fullscreen: =>
    $('.mobile_header').addClass 'hide'
    @dom.addClass 'fullscreen'

  close_fullscreen: =>
    @dom.removeClass 'fullscreen'
