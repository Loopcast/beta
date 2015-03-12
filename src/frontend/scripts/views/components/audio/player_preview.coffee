module.exports = (dom) ->
  
  is_playing = false
  icon       = dom.find '.circle_icon'

  ref = @

  dom.addClass 'player_preview'

  play = ->
    return if is_playing

    is_playing = true
    dom.addClass 'playing'
    icon.addClass( 'ss-pause' ).removeClass( 'ss-play' )


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