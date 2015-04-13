L       = require '../../api/loopcast/loopcast'
A       = require '../../api/appcast/appcast'
appcast = require '../../controllers/appcast'

# fetch information from backend
live = false

module.exports = ( dom ) ->

  dom.find('a').click ->

    if not live
      console.log "clicked go live!"

      # TODO: make it clever
      user_id = location.pathname.split("/")[1]

      dom.find('a').html "..."

      A.start_stream user_id, ( error, callback ) ->

        if error is 'no_input_device'

          alert 'select input device first'
          console.error "can't got live without selecting input device"

          return

        dom.find('a').html "GO OFFLINE"

    if live
      console.log "clicked go offline!"

      dom.find('a').html "..."

      A.stop_stream user_id, ( error, callback ) ->

        if error is 'no_input_device'

          alert 'select input device first'
          console.error "can't got live without selecting input device"

          return

        dom.find('a').html "GO LIVE"

    # cancels click action
    return false