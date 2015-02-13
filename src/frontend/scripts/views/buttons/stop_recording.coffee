socket = require 'app/controllers/socket'

module.exports = ( dom ) ->

  dom.click -> 

    if not socket.get 'stream:recording'

      console.error '- cant stop recording if not recording'
      return

    console.log '+ stopping to record with ', socket.get 'input_device'
    
    # post to backend in order to start recording set

    url  = "/tape/stop/recording"
    done = ->
      console.info '+ /tape/stop/recording post done ->', arguments

    fail = ->
      console.error '- /tape/stop/recording post failed ->', arguments

    # post to backend in order to start recording
    $.post( url ).done( done ).fail( fail )