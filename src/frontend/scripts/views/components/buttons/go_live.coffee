L       = require '../../../api/loopcast/loopcast'
appcast = require '../../../controllers/appcast'

module.exports = ( dom ) ->

  dom.find('a').click ->

    console.log "clicked go live!"

    if not appcast.get( 'input_device' )

      console.error "can't got live without selecting input device"

      return

    # start Appcast streaming
    appcast.start_stream appcast.get( 'input_device' )

    dom.find('a').html "WAITING APPCAST"

    # wait Appcast to be live, so then we can update
    # the backend
    appcast.on 'stream:online', ( status ) ->

      if not status

        dom.find('a').html "WENT OFFLINE : ("

        return

      dom.find('a').html "APPCAST IS STREAMING! "

      # gets the id of the room from the url
      room_id = location.pathname.split("/")[2]

      L.rooms.start_stream room_id, ( error ) ->

        if error 

          console.error error

          return

    return false