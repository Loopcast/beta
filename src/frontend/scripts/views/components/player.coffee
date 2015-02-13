socket  = require 'app/controllers/socket'

module.exports = ( dom ) ->

  # shortcut to audio tag
  audio = dom.find 'audio'
  # grabs stream url from DOM attribute
  stream = audio.data 'src'

  # set a dummy status message for the stream
  audio.hide()
  dom.find( '.status' ).html '... waiting stream to start ...'

  # temporary solution while we don't have sockets to the webserver
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

  # temporary hack to start audio only after stream starts
  socket.on 'streaming', start_audio

  # console.log 'hey ->', dom