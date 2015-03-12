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
      request = $.post api_url + 'rooms/create', data

      request.error ( error ) ->

        console.error 'error creating calling create/room'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

    start_stream: ( room_id, callback ) ->

      data = room_id: room_id

      request = $.post api_url + 'stream/start', data

      request.error ( error ) ->

        console.error 'error creating calling stream/start'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

    stop_stream: ( callback ) ->

      callback null, 'blah'

    start_recording: ( callback ) ->

      data = room_id: room_id

      request = $.post api_url + 'tape/start', data

      request.error ( error ) ->

        console.error 'error creating calling tape/start'
        console.error error

        callback error

      request.done ( response ) ->

        if response.error then return callback response.error

        callback  null, response

    stop_recording: ( callback ) ->

      callback null, 'blah'