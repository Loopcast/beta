socket = require 'app/controllers/socket'

module.exports = ( dom ) ->

  dom.click -> 

    if not socket.get 'streaming'

      console.error '- cant stop stream if not streaming'
      return

    console.log '+ stoping streaming with', socket.get 'input_device'
    
    socket.stop_stream()