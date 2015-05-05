L = require 'api/loopcast/loopcast'

module.exports = (dom) ->
  
  is_playing = false
  icon       = dom.find '.ss-play'
  data       = null
  room_id    = dom.find 'room-id'

  if icon.length <= 0
    icon       = dom.find '.ss-pause'

    if icon.length <= 0
      log "ERROR -> [PLAYER PREVIEW]. icon.length <= 0"
      return

  ref = @

  dom.addClass 'player_preview'

  
  

  play = ->
    return if is_playing

    is_playing = true
    dom.addClass 'playing'
    icon.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    L.rooms.info room_id, (data) -> 
      app.player.play data

      app.emit 'audio:started', ref.uid

  stop = (stop_player = true) ->
    return if not is_playing

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

    app.on 'audio:started', (uid) ->
      if uid isnt ref.uid
        stop( false )


  init()