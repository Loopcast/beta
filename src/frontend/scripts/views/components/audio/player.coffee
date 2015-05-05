moment = require 'moment'
seconds_to_time = require 'app/utils/time/seconds_to_time'
module.exports = class Player
  is_playing: false


  constructor: ( @dom ) ->
    @thumb  = @dom.find '.player_icon img'
    @title  = @dom.find '.player_title'
    @author = @dom.find '.player_author'
    @audio  = @dom.find 'audio'
    @time   = @dom.find '.player_time'

    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main

    @share = view.get_by_dom @dom.find( '.share_wrapper' )

    view.off 'binded', @on_views_binded
    
  

    
  play: (data) ->

    if @data?.streaming_url is data.streaming_url
      log "[Player] play. no action because it's already streaming the same url."
      return

    @stop( false ) if @is_playing

    log "[Player] play", data, @is_playing

    @thumb.attr 'src', data.thumb
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

    log "[Player] setting streaming_url", data.streaming_url
    @audio.attr 'src', data.streaming_url


    @data = data

    # TEMP: It should be called when the streaming works
    @on_player_started()

      


  on_player_started: =>
    log "[Player] on_player_started", @data

    @is_playing = true

    @timer_interval = setInterval @check_time, 1000
    
    @time.html "&nbsp;"

    @open()

  stop: (should_close = true) ->
    log "[Player] stop"
    @is_playing = false
    clearInterval @timer_interval
    @data = null
    @close() if should_close

  check_time: =>
    now      = moment.utc()
    started  = moment.utc @data.status.live.started_at
    seconds = now.diff started, 'seconds'

    time = seconds_to_time seconds

    @time.html time



  close: ( ) ->
    app.body.removeClass 'player_visible'
    @dom.removeClass 'visible'

  open: ( data ) =>
    app.body.addClass 'player_visible'
    @dom.show()
    delay 1, => @dom.addClass 'visible'



