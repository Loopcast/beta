L = require 'api/loopcast/loopcast'

module.exports = (dom) ->
  
  is_playing = false
  handler    = dom.find '.circle_icon, .loading_spin, .tape_play'
  icon       = dom.find '.circle_icon, .tape_play'
  data       = null
  room_id    = dom.data 'room-id'
  is_tape    = not dom.data( 'is-live' )
  room_info = null
  source_src = null

  source = dom.find '.source_src'

  if dom.data( 'audio-url' )?
    source_src = dom.data( 'audio-url' )
  else if source.length > 0
    source_src = source.attr 'value'

  log "[PlayerPreview] init", source_src

  if not room_id then returns
    

  if handler.length <= 0
    handler       = dom.find '.image .ss-pause, .loading_spin, .ss-play'

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

  toggle = (e) ->
    e.stopPropagation()
    e.preventDefault()
    
    if is_playing
      dom.removeClass 'preloading'
      app.player.stop()
    else
      dom.addClass 'preloading'

      if is_tape
        app.player.play room_id, source_src
      else
        app.player.play_live room_id, source_src

  init = ->
    handler.on 'click', toggle
    app.on  'audio:started', on_play
    app.on  'audio:paused', on_stop

    if app.player?.current_room_id is room_id
      on_play room_id

  init()