L       = require '../../../api/loopcast/loopcast'
appcast = require '../../../controllers/appcast'

module.exports = ( dom ) ->

  dom.find('a').click ->

    console.log "clicked go live!"

    appcast.start_stream()

    L.rooms.start_stream ( error ) ->

      if error 

        console.error error

        return

      dom.find('a').html "WAITING APPCAST"        

    return false