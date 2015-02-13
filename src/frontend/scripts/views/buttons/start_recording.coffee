socket = require 'app/controllers/socket'

module.exports = ( dom ) ->

  dom.click -> 

    if not socket.get 'streaming'

      console.error '- cant start recording if not streaming'
      return

    console.log '+ start recording', socket.get 'input_device'
    
    # post to backend in order to start recording set

    url  = "/tape/start/recording"
    done = ->
      console.info '+ recording post done ->', arguments
      socket.set 'recording', true

    fail = ->
      console.error '- failing trying to start recording ->', arguments

    # post to backend in order to start recording
    $.post( url ).done( done ).fail( fail )