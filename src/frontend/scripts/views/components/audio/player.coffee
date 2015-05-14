time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'

moment = require 'moment'

module.exports = class Player
  is_playing: false
  like_lock: false
  is_recorded: false

  constructor: ( @dom ) ->
    @thumb    = @dom.find '.player_icon img'
    @title    = @dom.find '.player_title'
    @author   = @dom.find '.player_author'
    @audio    = @dom.find 'audio'
    @time     = @dom.find '.player_time'
    @play_btn = @dom.find '.ss-play'
    @like_btn = @dom.find '.ss-heart'
    @progress = @dom.find '.player_progress span'

    @play_btn.on 'click', @on_play_clicked
    @like_btn.on 'click', @on_like_clicked

    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main

    @share = view.get_by_dom @dom.find( '.share_wrapper' )

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
    if @is_playing
      @stop()
    else
      @_play()

    
  play: (data) ->
    log "[Player] play", data
    if @data?.room._id is data.room._id
      log "[Player] play. no action because it's already streaming the same url."
      return

    @stop( false ) if @is_playing

    # log "[Player] play", data, @is_playing

    room_link = "/#{data.user.info.username}/#{data.room.slug}"
    @thumb.attr 'src', transform.player_thumb data.room.info.cover_url
    @title.html data.room.info.title
    @author.html "By " + data.user.info.name

    @author.attr 'title', data.user.info.name
    @title.attr 'title', data.room.info.title

    @author.attr 'href',  "/" + data.user.info.username
    @title.attr 'href', room_link

    @thumb.parent().attr 'href', room_link
    @thumb.parent().attr 'title', data.room.info.title

    @share.update_link room_link

    if data.room.status.is_live
      @dom.addClass 'is_live'
    else
      @dom.removeClass 'is_live'

    if data.room.info.file
      @audio.attr 'src', data.room.info.file
      @start_time = moment()
      @is_recorded = true
    else
      @audio.attr 'src', data.room.info.url
      @start_time = data.room.status.live.started_at
      @is_recorded = false

    @data = data

    @_play()



  _play: ->
    
    log "[Player] _play"
    @play_btn.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    @audio[0].play()
    if @is_recorded
      @audio[0].addEventListener 'loadedmetadata', @on_player_started
      @audio[0].addEventListener 'ended', @on_player_stopped

    else
      # TEMP: It should be called when the streaming works
      @on_player_started()


  on_player_started: =>
    # log "[Player] on_player_started", @data

    app.emit 'audio:started', @data.room._id

    if @is_recorded
      @duration = @audio[0].duration


    @is_playing = true

    @timer_interval = setInterval @check_time, 1000
    
    @time.html "&nbsp;"

    @open()

  on_player_stopped: =>
    if not @is_playing
      log "[Player] on_player_stopped. returend bcause is not playing"
      return 
    log "[Player] on_player_stopped"
    @stop()

  stop: (should_close = false) ->
    
    if not @is_playing
      log "[Player] stop. returend bcause is not playing"
      return 

    log "[Player] stop"

    @play_btn.removeClass( 'ss-pause' ).addClass( 'ss-play' )

    @is_playing = false
    clearInterval @timer_interval
    @audio[0].pause?()
    @progress.css 'width', '0%'
    @time.html "00:00:00"
    app.emit 'audio:paused', @data.room._id
    @close() if should_close

    @data = null

  check_time: =>
    time = time_to_string @start_time
    @time.html time.str

    if @is_recorded

      perc = Math.min( 100, time.seconds / @duration * 100 )
      @progress.css 'width', perc + '%'
      log @duration, time.seconds

  close: ( ) ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: ( data ) =>
    app.body.addClass 'player_visible'
    @dom.show()
    delay 1, => @dom.addClass 'visible'



