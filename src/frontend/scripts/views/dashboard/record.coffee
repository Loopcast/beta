L       = require '../../api/loopcast/loopcast'
appcast = require '../../controllers/appcast'

recording = false

module.exports = ( dom ) ->

  start_recording = ( callback ) ->
    room_id = location.pathname.split("/")[2]

    L.rooms.start_recording room_id, ( error, response ) ->

      if error

        console.error "error when recording room", error

        dom.find('a').html "ERROR"

        return

      recording = true
      dom.find('a').html "STOP REC"
    
  dom.find('a').click ->

    if not recording
      console.log "clicked go recording!"

      if not appcast.get 'input_device'

        alert 'select input device first'

        return

      dom.find('a').html "..."

      if appcast.get 'stream:online'
        # if streaming, start recording!

        start_recording()

      else
      # TODO: make it clever
        user_id = location.pathname.split("/")[1]
        
        # start streaming then start recording
        appcast.start_stream user_id, appcast.get 'input_device'

        appcast.on 'stream:online', start_recording

    if recording
      console.log "clicked stop recording!"

      dom.find('a').html "..."

      user_id = location.pathname.split("/")[1]
      room_id = location.pathname.split("/")[2]

      L.rooms.stop_recording room_id, ( error, callback ) ->

        if error

          console.error "error while stopping recording"

          return

        recording = false

        dom.find('a').html "RECORDED"

        channel = pusher.subscribe "tape.#{user_id}"

        channel.bind "upload:finished", ( file ) ->
          console.log "finished uploading file ->", file
          
          alert "Uploaded file! #{file}"

        channel.bind "upload:error", ( error ) ->
          console.error "failed uploading ->", error
          
          alert "Error uploading file :("

        channel.bind "upload:failed", ( error ) ->
          console.log "failed uploading ->", error
          
          alert "Failed uploading file :("

    # cancels click action
    return false