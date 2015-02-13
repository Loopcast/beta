socket = require 'app/controllers/socket'

module.exports = ( dom ) ->

  dom.click -> 

    if not socket.get 'input_device'

      console.error '- cant start stream before selecting input device'
      return

    console.log 'starting streaming with', socket.get 'input_device'
    
    socket.start_stream socket.get 'input_device'