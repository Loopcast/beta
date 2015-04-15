L = require '../../api/loopcast/loopcast'

recording = false

module.exports = ( dom ) ->

  dom.find('a').click ->

    # TODO: make it clever
    user_id = location.pathname.split("/")[1]
    room_id = location.pathname.split("/")[2]

    if not recording
      console.log "clicked go recording!"

      if not appcast.get 'input_device'

        alert 'select input device first'

        return


      dom.find('a').html "..."

      A.start_stream user_id, room_id, ( error, callback ) ->

        recording = true

        dom.find('a').html "GO OFFLINE"

    if recording
      console.log "clicked go offline!"

      dom.find('a').html "..."

      A.stop_stream user_id, room_id, ( error, callback ) ->

        if error is 'no_input_device'

          alert 'select input device first'
          console.error "can't got recording without selecting input device"

          return

        recording = false

        dom.find('a').html "GO LIVE"

    # cancels click action
    return false