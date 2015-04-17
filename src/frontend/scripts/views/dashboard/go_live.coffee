L       = require '../../api/loopcast/loopcast'
appcast = require '../../controllers/appcast'

module.exports = ( dom ) ->

  # TODO: fetch information from backend
  live = false

  # listens for appcast streaming status while streaming
  while_streaming = ( status ) ->

    if not status

      alert 'streaming went offline while streaming'

      return

    if status
      alert 'streaming went online while streaming'

      return      

  # listens for appcast streaming status when starting the stream
  waiting_stream = ( status ) ->

    if not status then return

    # call the api
    L.rooms.start_stream $( '#room_id' ).val(), ( error, result ) ->

      if error
        dom.find('a').html "error"

        console.error error

        # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
        return

      appcast.off waiting_stream

      # TODO: fix this error being thrown
      # appcast.on while_streaming

      live = true

      dom.find('a').html "GO OFFLINE"


  dom.find('a').click ->

    # TODO: make it clever
    user_id = location.pathname.split("/")[1]

    if not live
      console.log "clicked go live!"

      if not appcast.get 'input_device'

        alert 'select input device first'

        return


      # waiting stream status
      dom.find('a').html "..."

      appcast.start_stream user_id, appcast.get 'input_device'

      appcast.on 'stream:online', waiting_stream


    if live
      console.log "clicked go offline!"

      if not appcast.get 'stream:online'

        alert '- cant stop stream if not streaming'

        return

      dom.find('a').html "..."

      appcast.stop_stream()

      # TODO: make it clever
      L.rooms.stop_stream $( '#room_id' ).val(), ( error, callback ) ->

        if error
          dom.find('a').html "error"

          console.error error

          # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
          return

        live = false

        dom.find('a').html "GO LIVE"

    # cancels click action
    return false