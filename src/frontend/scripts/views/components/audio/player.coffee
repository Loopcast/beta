time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
notify          = require 'app/controllers/notify'
string_utils = require 'app/utils/string'
ProgressDragger = require 'app/utils/progress_dragger'
normalize_info = require 'app/utils/rooms/normalize_info'
login_popup = require 'app/utils/login_popup'
radiokit_playback = require 'radiokit-toolkit-playback'
radiokit_metadata = require 'radiokit-toolkit-broadcast-metadata'

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
  radiokit_setup: {}


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

    @initialize_radiokit_setup()


  initialize_radiokit_setup:  =>    
    @add_channel_to_radiokit_setup("0a86ec50-53ba-4a2f-986a-17c2621492f7", "acidhouse")
    @add_channel_to_radiokit_setup("2fc3da41-3b5a-4fca-ab27-349e5dede7cb", "afrobrazilian")
    @add_channel_to_radiokit_setup("6f394f81-ee6b-4e8b-bfd9-d6ef968f1e3e", "ambient")
    @add_channel_to_radiokit_setup("f72fbc70-dda0-461f-b31e-513383488241", "braziliannights")
    @add_channel_to_radiokit_setup("6f98a5f5-5a33-453a-ac86-96e3b49a7e1d", "berlintechno")
    @add_channel_to_radiokit_setup("10d61d50-63ea-4978-b375-8fc1f89198dc", "deepspacepodcast")
    @add_channel_to_radiokit_setup("3b6c543f-a656-416f-9529-12076a79f0f3", "dnbjungle")
    @add_channel_to_radiokit_setup("78490f7e-68ad-4011-9ab9-59cffffbd628", "detroithouse")
    @add_channel_to_radiokit_setup("066dd3c9-a8cc-45bb-92a6-66e8d48e2227", "detroittechno")
    @add_channel_to_radiokit_setup("8e15700b-7fd5-4efb-9f91-c7abe8ff10e3", "deephouse")
    @add_channel_to_radiokit_setup("4c944fc4-eb41-4e88-8d06-770f5e1febd1", "disco")
    @add_channel_to_radiokit_setup("76337b17-cddb-4070-ac37-ddddef6acee7", "dubtechno")
    @add_channel_to_radiokit_setup("2c0a20df-a974-4fca-bf5f-812e8f9f82cc", "frenchhouse")
    @add_channel_to_radiokit_setup("750cecfd-6d28-47ec-a441-31bc8b7de3e8", "goldenagehiphop")
    @add_channel_to_radiokit_setup("33445461-336d-4627-b575-d5cf9b803b81", "italonsynths")
    @add_channel_to_radiokit_setup("46da5c19-2efe-4a71-ac10-3eeb221ec42c", "jazz")
    @add_channel_to_radiokit_setup("efc45a32-ffa9-48db-9adb-e28431e2f109", "modernhiphop")
    @add_channel_to_radiokit_setup("7161c70b-33e0-41ff-8a90-f711f5fe3b19", "oldschoolhouse")
    @add_channel_to_radiokit_setup("3dc12d36-8423-47a4-987f-786b645f7416", "reggaedub")
    @add_channel_to_radiokit_setup("2d7ad571-34a4-436d-8654-7865bec5e9e8", "soulfulhouse")
    @add_channel_to_radiokit_setup("7feed3ea-4f9d-4a3f-a432-e17da7ba7c15", "techhouse")
    @add_channel_to_radiokit_setup("fd9a7d1c-a387-40a0-b876-2799668d6f9d", "ukg")
    @add_channel_to_radiokit_setup("db0e45c5-05c9-41c2-a457-84912b4c4b66", "minimalhouse")
    @add_channel_to_radiokit_setup("d8f8547d-277d-457d-9094-5b32bffa51db", "leftfieldhouse")
    @add_channel_to_radiokit_setup("9e145e40-e7a8-44a3-b885-81b270da6fa0", "worldmusic")


  add_channel_to_radiokit_setup: ( radiokit_channel_id, radiokit_lineup_channel_id ) =>
    @radiokit_setup[radiokit_channel_id] = new radiokit_playback.Channel.Setup(
      radiokit_channel_id,
      "https://lineup-traxvibes.radiokitapp.org",
      radiokit_lineup_channel_id,
      "http://tube-traxvibes-#{radiokit_lineup_channel_id}.radiokitapp.org",
      "mp3",
      192
    )


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
    @like_btn.click @on_like_clicked

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
      @radiokit_stop()
      @show_play_button()
      console.log 'audio:paused due to on_play_clicked'
      console.log "@current_room_id", @current_room_id

      app.emit 'audio:paused', @current_room_id
    else
      console.log 'audio:loading due to on_play_clicked'
      console.log "@current_room_id ", @current_room_id

      app.emit 'audio:loading', @current_room_id
      @show_loading()
      @radiokit_start()

    #@audio.toggle()
    return false


  radiokit_start : ->
    @radiokit_player.start()
    @radiokit_metadata.start()
      .then(() => console.log('radiokit metadata started'))
      .catch(() => console.warn('radiokit metadata start failed', reason))


  radiokit_stop : ->
    @radiokit_player.stop()
    @radiokit_player.stopFetching()
    @radiokit_player.offAll()
    @radiokit_metadata.stop()
      .then(() => console.log('radiokit metadata stopped'))
      .catch(() => console.warn('radiokit metadata stop failed', reason))


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
    #if @current_room_id is room_id
      #@stop()

      #return

    @initialize_player(radiokit_channel_id)

    @radiokit_start()

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
        @radiokit_stop()
      catch e
        console.log "error stopping player on initialize_player"
        console.log e

    @radiokit_player = new radiokit_playback.Channel.Player(
      @radiokit_setup[radiokit_channel_id],
      '1:i23jsnduSD82jSjda7sndyasbj*ID2hdydhs'
    )
    @radiokit_metadata = new radiokit_metadata.MetadataListener(
      '1:i23jsnduSD82jSjda7sndyasbj*ID2hdydhs',
      radiokit_channel_id      
    )
    @radiokit_player.on('playback-started', @onPlaybackStarted)

    # Chrome & FF 
    # FIXME THIS IS A DEPRECATED RADIOKIT API
    if @radiokit_player.supportsAudioManager()
      @radiokit_player.on('track-playback-started', @onTrackPlaybackStarted)
      @radiokit_player.on('track-position', @onTrackPosition)

    # Safari & Mobile
    else
      @radiokit_metadata.setUpdateCallback(@onMetadata)
      @radiokit_metadata.setPositionInterval(250)
      @radiokit_metadata.setPositionCallback(@onPosition)

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

  onPlaybackStarted:  =>
    console.log "audio:started ->", @current_room_id

    app.emit "audio:started", @current_room_id
    @show_pause_button()

  # Chrome & FF 
  # FIXME THIS IS A DEPRECATED RADIOKIT API
  onTrackPlaybackStarted: (track) =>
    @clearFileInfo()

    track.getInfoAsync()
      .then (info) =>
        metadata = info.getMetadata()

        if metadata.artist
          @track_artist.html metadata.artist
        if metadata.title
          @track_title.html metadata.title
        if metadata.artist and metadata.title
          @track_separator.html ' - '
        if metadata.itunes_view_url and metadata.itunes_view_url.trim() != ""
          @itunes_button.attr('href', metadata.itunes_view_url + '&at=1000l5ZB')
          @itunes_button.css('display', 'block')

  # Chrome & FF 
  # FIXME THIS IS A DEPRECATED RADIOKIT API
  onTrackPosition: (track, position, duration) =>
    @progress.css 'width', (position / duration * 100) + '%'
    @time.html @_humanTime(position)
    @time_tot.html "-" + @_humanTime(duration - position)

  # Safari & Mobile
  onMetadata: (metadata) =>
    @clearFileInfo()

    if metadata
      if metadata.artist
        @track_artist.html metadata.artist
      if metadata.title
        @track_title.html metadata.title
      if metadata.artist and metadata.title
        @track_separator.html ' - '
      if metadata.itunes_view_url and metadata.itunes_view_url.trim() != ""
        @itunes_button.attr('href', metadata.itunes_view_url + '&at=1000l5ZB')
        @itunes_button.css('display', 'block')

  # Safari & Mobile
  onPosition: (position, duration) =>
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
      @radiokit_stop()
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
