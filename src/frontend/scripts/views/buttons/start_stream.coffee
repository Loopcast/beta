appcast = require 'app/controllers/appcast'

module.exports = ( dom ) ->

  dom.click -> 

    if not appcast.get 'input_device'

      console.error '- cant start stream before selecting input device'
      return

    console.log 'starting streaming with', appcast.get 'input_device'
    
    appcast.start_stream appcast.get 'input_device'