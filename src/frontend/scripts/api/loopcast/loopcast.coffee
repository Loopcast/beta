api_url = "/api/v1/"

module.exports = 

  genres : 
    all: ( callback ) ->
      request = $.get api_url + 'genres/all'

      request.error ( error ) ->

        console.error 'error fetching genres'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

  rooms :
    create: ( data, callback ) ->
      on_status_code:
        401: ( response ) -> console.error 'unauthorized, need to be logged in!'

      request = $.post api_url + 'rooms/create', data, on_status_code

      request.error ( error ) ->

        console.error 'error creating calling create/room'
        console.error error

        callback error

      request.done ( response ) ->

        callback  null, response

    start_stream: ( room_id, callback ) ->
      on_status_code:
        401: ( response ) -> console.error 'unauthorized, need to be logged in!'

      data = room_id: room_id

      request = $.post api_url + 'stream/start', data, on_status_code

      request.error ( error ) ->

        console.error 'error creating calling stream/start'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

    stop_stream: ( room_id, callback ) ->
      on_status_code:
        401: ( response ) -> console.error 'unauthorized, need to be logged in!'

      data = room_id: room_id

      request = $.post api_url + 'stream/stop', data, on_status_code

      request.error ( error ) ->

        console.error 'error creating calling stream/stop'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

    start_recording: ( callback ) ->
      on_status_code:
        401: ( response ) -> console.error 'unauthorized, need to be logged in!'

      data = room_id: room_id

      request = $.post api_url + 'tape/start', data, on_status_code

      request.error ( error ) ->

        console.error 'error creating calling tape/start'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

    stop_recording: ( room_id, callback ) ->
      on_status_code:
        401: ( response ) -> console.error 'unauthorized, need to be logged in!'

      data = room_id: room_id

      request = $.post api_url + 'stape/stop', data, on_status_code

      request.error ( error ) ->

        console.error 'error creating calling stape/stop'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response