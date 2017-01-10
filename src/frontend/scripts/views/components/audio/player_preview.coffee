L = require 'api/loopcast/loopcast'

module.exports = (dom) ->

  is_playing = false

  if dom.hasClass "in_a_room"
    handler    = dom
  else
    handler    = dom.find '.circle_icon, .loading_spin, .tape_play'

  icon       = dom.find '.circle_icon, .tape_play'
  data       = null
  room_id    = dom.data 'room-id'
  is_tape    = not dom.data( 'is-live' )
  room_info = null
  source_src = null
  radiokit_channel_id = dom.data 'radiokit-channel-id'

  source = dom.find '.source_src'

  #console.log 'player preview ->', dom[0]
  #console.log 'room_id ->', room_id
  #console.log 'radiokit_channel_id ->', radiokit_channel_id

  if dom.data( 'audio-url' )?
    source_src = dom.data( 'audio-url' )
  else if source.length > 0
    source_src = source.attr 'value'

    #console.log "onTrackPlayback"

  return if not room_id

  if handler.length <= 0
    handler       = dom.find '.image .ss-pause, .loading_spin, .ss-play'
    return if handler.length <= 0

  ref = @

  dom.addClass 'player_preview'


  on_play = (_room_id) ->
    #console.log 'player_preview: on_play'
    #console.log "_room_id", _room_id
    #console.log 'room_id', room_id

    if _room_id is room_id

      #console.log "playing ->", room_id

      is_playing = true
      dom.addClass 'playing'
      dom.removeClass 'preloading'

      if dom.hasClass "in_a_room"
        dom.find( ".fa-pause-circle" ).show()
        dom.find( ".fa-play-circle" ).hide()
      else
        icon.addClass( 'fa-pause-circle' ).removeClass( 'fa-play-circle' )

    else
      on_stop(_room_id)

  on_stop = (_room_id)->

    #return if not is_playing

    is_playing = false
    dom.removeClass 'playing'
    dom.removeClass 'preloading'

    if dom.hasClass "in_a_room"
      dom.find( ".fa-pause-circle" ).hide()
      dom.find( ".fa-play-circle" ).show()
    else
      icon.removeClass( 'fa-pause-circle' ).addClass( 'fa-play-circle' )

  on_loading = (_room_id) ->
    #console.warn "LOADING"
    #console.log "_room_id", _room_id
    #console.log "room_id", room_id

    if _room_id is room_id
      dom.addClass 'preloading'
      dom.removeClass 'playing'
    else
      on_stop(_room_id)


  toggle = (e) ->
    #console.warn "toggling!! preview: ", room_id

    e.stopPropagation()
    e.preventDefault()

    if is_playing
      app.player.stop()
    else
      #console.log "general play", room_id, radiokit_channel_id
      app.player.general_play room_id, radiokit_channel_id

  init = ->
    #console.log 'player_preview init'

    handler.on 'click', toggle
    app.on 'audio:started', on_play
    app.on 'audio:loading', on_loading
    app.on 'audio:paused' , on_stop

    if app.player.current_room_id is room_id and app.player.is_playing
      on_play room_id
    else
      on_stop room_id

  delay 2, init
