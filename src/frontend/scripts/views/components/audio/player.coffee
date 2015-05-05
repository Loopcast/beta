moment = require 'moment'
module.exports = class Player
  constructor: ( @dom ) ->
    @thumb  = @dom.find '.player_icon img'
    @title  = @dom.find '.player_title'
    @author = @dom.find '.player_author'
    @audio  = @dom.find 'audio'
    @time   = @dom.find '.player_time'

    # delay 2000, =>
    #   @open 
    #     thumb: "/images/profile_big.png"
    #     title: "Live from Siracusa"
    #     author: "Stefano Ortisi"
    #     url: "http://loopcast.com/stefanoortisi/live"
    #     author_link: "http://loopcast.com/stefanoortisi"

    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main
    log "----> on views binded"
    @share = view.get_by_dom @dom.find( '.share_wrapper' )

    view.off 'binded', @on_views_binded
    
  open: ( data ) ->
    if data?
      log "[Player] open", data

      @thumb.attr 'src', data.thumb
      @title.html data.title
      @author.html "By " + data.author

      @author.attr 'title', data.title
      @title.attr 'title', data.author

      @author.attr 'href', data.author_link
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

      @dom.show()
      delay 1, => @dom.addClass 'visible'

  on_player_started: =>
    log "[Player] on_player_started", @data

    @timer_interval = setInterval @check_time, 1000
    
    @time.html "00:00"

  on_player_stopped: =>
    clearInterval @timer_interval

  check_time: =>
    now      = moment.utc()
    started  = moment.utc @data.status.live.started_at

    hours   = now.diff started, 'hours'
    minutes = now.diff started, 'minutes'
    seconds = now.diff started, 'seconds'

    log hours, minutes, seconds
    # log "duration", duration



  close: ( ) ->
    @dom.removeClass 'visible'

  play: ( mountpoint ) ->
    @open()

    @audio.attr 'src', "http://radio.loopcast.fm:8000/#{mountpoint}"



