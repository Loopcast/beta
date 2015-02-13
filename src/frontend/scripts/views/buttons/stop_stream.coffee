appcast = require 'app/controllers/appcast'

module.exports = ( dom ) ->

  dom.click -> 

    if not appcast.get 'streaming:online'

      console.error '- cant stop stream if not streaming'
      return

    console.log '+ stoping streaming with', appcast.get 'input_device'
    
    appcast.stop_stream()