module.exports = (dom) ->
  
  is_playing = false
  icon       = dom.find '.ss-play'
  data       = null

  if icon.length <= 0
    icon       = dom.find '.ss-pause'

    if icon.length <= 0
      log "ERROR -> [PLAYER PREVIEW]. icon.length <= 0"
      return

  ref = @

  dom.addClass 'player_preview'

  is_player_component = dom.find( 'input[name=room_thumb]' ).length <= 0

  if not is_player_component
    data = 
      thumb: dom.find( 'input[name=room_thumb]' ).val()
      title: dom.find( 'input[name=room_title]' ).val()
      url: dom.find( 'input[name=room_link]' ).val()
      author: dom.find( 'input[name=room_author]' ).val()
      author_id: dom.find( 'input[name=room_author_id]' ).val()
      author_link: dom.find( 'input[name=room_author_link]' ).val()

  play = ->
    return if is_playing

    is_playing = true
    dom.addClass 'playing'
    icon.addClass( 'ss-pause' ).removeClass( 'ss-play' )

    if not is_player_component
      app.player.open data

    app.emit 'audio:started', ref.uid

  stop = ->
    return if not is_playing

    is_playing = false
    dom.removeClass 'playing'
    icon.removeClass( 'ss-pause' ).addClass( 'ss-play' )


  toggle = ->
    if is_playing
      stop()
    else
      play()

  init = ->
    icon.on 'click', toggle

    app.on 'audio:started', (uid) ->
      if uid isnt ref.uid
        stop()


  init()