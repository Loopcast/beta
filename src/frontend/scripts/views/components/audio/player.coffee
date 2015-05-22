api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'

moment = require 'moment'

module.exports = class Player
  is_playing: false
  like_lock: false
  is_recorded: false
  last_time: ""

  constructor: ( @dom ) ->
    @thumb    = @dom.find '.player_icon img'
    @title    = @dom.find '.player_title'
    @author   = @dom.find '.player_author'
    @time     = @dom.find '.player_time'
    @play_btn = @dom.find '.ss-play'
    @like_btn = @dom.find '.ss-heart'
    @progress = @dom.find '.player_progress span'
    @progress_parent = @dom.find '.player_progress'
    # @loading = @dom.find '.loading_screen'

    @play_btn.on 'click', @on_play_clicked
    @like_btn.on 'click', @on_like_clicked
    @progress_parent.on 'click', @on_progress_click

    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main

    @share = view.get_by_dom @dom.find( '.share_wrapper' )
    @audio = view.get_by_dom @dom.find( 'audio' )
    @audio.on 'started', @on_audio_started
    @audio.on 'paused', @on_audio_stopped
    @audio.on 'ended', @on_audio_ended
    @audio.on 'progress', @on_progress
    @audio.on 'snapped', @on_snapped

    view.off 'binded', @on_views_binded
    
  on_like_clicked: =>
    return if @like_lock

    @like_lock = true

    if @like_btn.hasClass 'liked'
      @unlike()
    else
      @like()

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



  on_play_clicked: =>
    @audio.toggle()

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

    
  play: (data = @data) ->
    log "[Player] play", data

    api.rooms.play data.room._id, (error, response) ->

    @data = data
    @update_info @data
    @audio.set_data @get_audio_data( @data )
    @audio.play()




  stop: ->
    @audio.pause()


  update_info: ( data ) ->

    log "[Player] update_info", data
    room_link = "/#{data.user.info.username}/#{data.room.info.slug}"
    @thumb.attr 'src', transform.player_thumb data.room.info.cover_url
    @title.html data.room.info.title
    @author.html "By " + data.user.info.name

    @author.attr 'title', data.user.info.name
    @title.attr 'title', data.room.info.title

    @author.attr 'href',  "/" + data.user.info.username
    @title.attr 'href', room_link

    @thumb.parent().attr 'href', room_link
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

  on_audio_started: =>    
    log "[Player] on_audio_started"

    @play_btn.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    app.emit 'audio:started', @data.room._id

    # @loading.fadeOut()
    @dom.removeClass 'loading'

    @open()

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

  on_progress: (data) =>
    @time.html data.time.str
    @progress.css 'width', data.perc + '%'

  on_progress_click: (e) =>

    return if not @audio.data.is_recorded
    x = e.offsetX
    w = @progress_parent.width()
    perc = x / w

    @dom.addClass 'loading'
    @audio.snap_to perc

  close: ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: =>
    app.body.addClass 'player_visible'
    @dom.show()
    delay 1, => @dom.addClass 'visible'



