api_url = "/api/v1/"

on_error = ( method, callback ) ->
  return ( error ) ->
    console.error "error calling #{method}"
    console.error error

    callback error    

module.exports = 

  genres : 
    all: ( callback ) ->
      request = $.get api_url + 'genres'

      request.error on_error 'genres', callback

      request.done ( response ) ->

        callback  null, response

  rooms :
    info: (room_id, callback ) ->

      callback
        thumb: '/images/default_room_thumb.jpg'
        title: 'The title'
        url: 'http://radio.loopcast.fm:8000/henriquematias'
        author: 'Henrique Matias'
        author_id: 'henriquematias'
        author_link: '/henriquematias'
        liked: false
        status:
          live:
            started_at: "2015-04-24T17:08:40.000Z"

    create: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'rooms/create', data, on_status_code

      request.error on_error 'rooms/create', callback

      request.done ( response ) ->

        callback  null, response

    update: ( id, data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.put api_url + "rooms/#{id}", data, on_status_code

      request.error on_error 'rooms/#{id}', callback

      request.done ( response ) ->
        log "[Loopcast] request done", response
        callback  null, response

    start_stream: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = room_id: room_id

      request = $.post api_url + 'stream/start', data, on_status_code

      request.error on_error 'stream/start', callback

      request.done ( response ) ->

        callback  null, response

    stop_stream: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        412: ( response ) -> callback 'Room not found or user not owner!'

      data = room_id: room_id

      request = $.post api_url + 'stream/stop', data, on_status_code

      request.error on_error 'stream/stop', callback

      request.done ( response ) ->

        callback  null, response

    start_recording: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        412: ( response ) -> callback 'Room not found or user not owner!'

      data = room_id: room_id

      request = $.post api_url + 'tape/start', data, on_status_code

      request.error on_error 'tape/start', callback

      request.done ( response ) ->

        callback  null, response

    stop_recording: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = room_id: room_id

      request = $.post api_url + 'tape/stop', data, on_status_code

      request.error on_error 'tape/stop', callback

      request.done ( response ) ->

        callback  null, response

  chat:
    message: ( data, callback ) ->

      on_status_code =
        400: -> callback 'bad request'
        401: -> callback 'unauthorized'
        500: -> callback 'server error'

      request = $.post api_url + 'chat/message', data, on_status_code

      request.error on_error 'chat/message', callback

      request.done ( response ) ->

        callback  null, response

    listener: ( data, callback ) ->
      on_status_code =
        400: -> callback 'bad request'
        401: -> callback 'unauthorized'
        500: -> callback 'server error'

      request = $.post "#{api_url}chat/listener", data, on_status_code

      request.error on_error "chat/listener", callback

      request.done ( response ) ->

        callback  null, response

  user:
    edit: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'user/edit', data, on_status_code

      request.error on_error 'user/edit', callback

      request.done ( response ) ->

        callback  null, response

    status: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'user/status', data, on_status_code

      request.error on_error 'user/status', callback

      request.done ( response ) ->

        callback  null, response