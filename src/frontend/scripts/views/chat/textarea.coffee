L = require '../../api/loopcast/loopcast'

module.exports = ( dom ) ->

  dom.on 'keyup', ( e ) ->

    # when pressing enter
    if e.keyCode is 13

      # grabs the message
      message = dom.val()
      user_id = location.pathname.split( "/" )[1]
      room_id = location.pathname.split( "/" )[2] # TODO: make it smart

      # clear the field
      dom.val ""

      L.chat.message user_id, room_id, message, ( error, response ) ->

        if error

          console.error "sending message: ", error
          return

        console.log "got response", response