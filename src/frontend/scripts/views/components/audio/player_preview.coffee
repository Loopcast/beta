L = require 'api/loopcast/loopcast'

module.exports = (dom) ->
  
  is_playing = false
  icon       = dom.find '.ss-play'
  data       = null
  room_id    = dom.data 'room-id'

  # temp
  title = dom.find( '.session_title' ).text()

  if icon.length <= 0
    icon       = dom.find '.ss-pause'

    if icon.length <= 0
      log "ERROR -> [PLAYER PREVIEW]. icon.length <= 0"
      return

  ref = @

  dom.addClass 'player_preview'

  
  

  play = ->
    return if is_playing

    # log "[PlayerPreview] play", title

    is_playing = true
    dom.addClass 'playing'
    icon.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    L.rooms.info room_id, (data) -> 
      data.title = title
      app.player.play data

      

  stop = (stop_player = true) ->
    return if not is_playing

    # log "[PlayerPreview] stop", title

    is_playing = false
    dom.removeClass 'playing'
    icon.removeClass( 'ss-pause' ).addClass( 'ss-play' )

    app.player.stop() if stop_player


  toggle = ->
    if is_playing
      stop()
    else
      play()

  init = ->
    icon.on 'click', toggle

    app.on 'audio:started', (_room_id) ->
      if _room_id isnt room_id
        # log "[PlayerPreview] on audio started. Stopped", title
        stop( false )

    app.on 'audio:paused', (_room_id) ->
      if _room_id isnt room_id and is_playing
        # log "[PlayerPreview] on audio paused. Stopped", title, _room_id, room_id
        stop( false )


  init()