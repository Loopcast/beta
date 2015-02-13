appcast  = require 'app/controllers/appcast'

module.exports = ( dom ) ->

  # shortcut to dom tags
  audio = dom.find 'audio'
  vu    = dom.find '.vu'
  
  # grabs stream url from DOM attribute
  stream = audio.data 'src'

  # hide items when initializing
  audio.hide()

  appcast.on 'connected', ( status ) ->

    if status
      dom.find( '.status' ).html '... waiting stream to start ...'
    else
      dom.find( '.status' ).html '... waiting AppCast to start ...'

  appcast.on "stream:error", ( error ) ->
    if not error then return

    dom.find( '.status' ).html "... #{error} ..."

  # temporary solution while we don't have appcasts to the webserver
  # check stream status and retries 100ms after response
  check_stream = ->

    $.get stream, ( error, response ) ->

      if error

        # try again
        delay 100, check_stream

        return console.error '- error loading streaming'

      console.warn '+ all good!'

  # TODO: Set Access-Control-Allow-Origin on streaming server so javascript
  # will be able to check stream status

  # do check_stream


  # reload audio tag
  start_audio = -> 
    audio.attr 'src', audio.data 'src'
    audio.show()

  stop_audio = ->
    audio.stop()
    audio.hide()

  # temporary hack to start audio only after stream starts
  appcast.on 'stream:online', ( status ) ->

    if status
      start_audio()
    else
      stop_audio()

  # console.warn "listening for vu"
  # temporary hack to start audio only after stream starts
  appcast.on 'stream:vu', ( meter ) ->

    vu.find( '.meter_left' ).width meter[0] * 1000
    vu.find( '.meter_right' ).width meter[1] * 1000