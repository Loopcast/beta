L = require 'api/loopcast/loopcast'

module.exports = (dom) ->
  
  is_playing = false
  handler    = dom.find '.circle_icon, .loading_spin'
  icon       = dom.find '.circle_icon'
  data       = null
  room_id    = dom.data 'room-id'
  room_info = null

  if not room_id
    return

  # temp
  title = dom.find( '.session_title' ).text()

  if handler.length <= 0
    handler       = dom.find '.image .ss-pause, .loading_spin'

    if handler.length <= 0
      log "ERROR -> [PLAYER PREVIEW]. handler.length <= 0"
      return

  ref = @

  dom.addClass 'player_preview'


  on_play = (_room_id) ->
    if _room_id is room_id
      log "[player_preview] on_play", room_info.room.info.title
      is_playing = true
      dom.addClass 'playing'
      dom.removeClass 'preloading'
      icon.addClass( 'ss-pause' ).removeClass( 'ss-play' )      
    else
      on_stop()

  on_stop = (_room_id) ->
    # if _room_id is room_id
    is_playing = false
    dom.removeClass 'playing'
    dom.removeClass 'preloading'
    icon.removeClass( 'ss-pause' ).addClass( 'ss-play' )


  request_play = ->
    log "[player_preview] request_play"
    dom.addClass 'preloading'

    if not room_info
      L.rooms.info room_id, (error, response) -> 

        log 'room info', response
        room_info = response
        app.player.play room_info
    else
      app.player.play room_info

  toggle = ->
    if is_playing
      app.player.stop()
    else
      request_play()

  init = ->
    handler.on 'click', toggle
    app.on  'audio:started', on_play
    app.on  'audio:paused', on_stop

  init()