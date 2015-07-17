L = require 'api/loopcast/loopcast'

module.exports = (dom) ->
  
  is_playing = false
  handler    = dom.find '.circle_icon, .loading_spin'
  icon       = dom.find '.circle_icon'
  data       = null
  room_id    = dom.data 'room-id'
  room_info = null
  source_src = null

  source = dom.find '.source_src'
  if source.length > 0
    source_src = source.attr 'value'

  if not room_id
    return

  if handler.length <= 0
    handler       = dom.find '.image .ss-pause, .loading_spin'

    if handler.length <= 0
      log "ERROR -> [PLAYER PREVIEW]. handler.length <= 0"
      return

  ref = @

  dom.addClass 'player_preview'


  on_play = (_room_id) ->
    if _room_id is room_id
      log "[player_preview] on_play"
      is_playing = true
      dom.addClass 'playing'
      dom.removeClass 'preloading'
      icon.addClass( 'ss-pause' ).removeClass( 'ss-play' )      
    else
      on_stop()

  on_stop = ->
    is_playing = false
    dom.removeClass 'playing'
    dom.removeClass 'preloading'
    icon.removeClass( 'ss-pause' ).addClass( 'ss-play' )

  toggle = ->
    if is_playing
      dom.removeClass 'preloading'
      app.player.stop()
    else
      dom.addClass 'preloading'
      app.player.play room_id, source_src

  init = ->
    handler.on 'click', toggle
    app.on  'audio:started', on_play
    app.on  'audio:paused', on_stop

  init()