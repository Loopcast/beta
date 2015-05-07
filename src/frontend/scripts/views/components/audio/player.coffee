time_to_string = require 'app/utils/time/time_to_string'
api = require 'api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'

module.exports = class Player
  is_playing: false
  like_lock: false

  constructor: ( @dom ) ->
    @thumb    = @dom.find '.player_icon img'
    @title    = @dom.find '.player_title'
    @author   = @dom.find '.player_author'
    @audio    = @dom.find 'audio'
    @time     = @dom.find '.player_time'
    @play_btn = @dom.find '.ss-play'
    @like_btn = @dom.find '.ss-heart'

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
    api.rooms.dislike @data.room_id, (error, response) =>
      log "[Player] dislike", error, response
      @like_lock = false
      
      if error
        notify.error "There was an error. Please try later."
        return
        
      @like_btn.removeClass 'liked'

  like: ->
    api.rooms.like @data.room_id, (error, response) =>
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
    if @data?.room_id is data.room_id
      log "[Player] play. no action because it's already streaming the same url."
      return

    @stop( false ) if @is_playing

    # log "[Player] play", data, @is_playing

    @thumb.attr 'src', transform.player_thumb data.thumb
    @title.html data.title
    @author.html "By " + data.author

    @author.attr 'title', data.title
    @title.attr 'title', data.author

    @author.attr 'href',  "/" + data.author_id
    @title.attr 'href', data.room_url

    @thumb.parent().attr 'href', data.url
    @thumb.parent().attr 'title', data.title

    @share.update_link data.room_url

    if data.status.live
      @dom.addClass 'is_live'
    else
      @dom.removeClass 'is_live'

    @audio.attr 'src', data.streaming_url

    @data = data

    @_play()



  _play: ->
    
    log "[Player] _play"
    @play_btn.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    @audio[0].play()
    # TEMP: It should be called when the streaming works
    @on_player_started()


  on_player_started: =>
    # log "[Player] on_player_started", @data

    app.emit 'audio:started', @data.room_id


    @is_playing = true

    @timer_interval = setInterval @check_time, 1000
    
    @time.html "&nbsp;"

    @open()

  stop: (should_close = true) ->
    # log "[Player] stop"

    @play_btn.removeClass( 'ss-pause' ).addClass( 'ss-play' )

    @is_playing = false
    clearInterval @timer_interval
    @audio[0].pause?()
    app.emit 'audio:paused', @data.room_id
    @close() if should_close

    @data = null

  check_time: =>
    time = time_to_string @data.status.live.started_at
    @time.html time

  close: ( ) ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: ( data ) =>
    app.body.addClass 'player_visible'
    @dom.show()
    delay 1, => @dom.addClass 'visible'



