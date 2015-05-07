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

      request.error on_error "genres", callback

      request.done ( response ) ->

        callback  null, response

  rooms :
    info: (room_id, callback ) ->

      request = $.get api_url + "rooms/#{room_id}/info"

      # request.error on_error "rooms/#{room_id}/info", callback

      request.error on_error "rooms/#{room_id}/info", ->
        console.log 'error finding room info'

      request.done ( response ) ->

        console.log 'got room info', response

        # i think it should just be
        # callback null, response
        # and then the receptor, will use "response.user" and "response.room"
        # to fill the data.
        # i have left below the best way to fetch the data at the moment.
        # since the application is constantly changing now we might need
        # to update this in the future, but it's the best way i found so far
        callback
          room_id: room_id
          thumb: response.room.info.cover || '/images/default_room_thumb.jpg'
          title: response.room.info.title
          room_url: "/#{response.room.info.user}/#{response.room.info.slug}"
          streaming_url: response.room.info.url
          author: response.user.info.name
          author_id: response.user.info.username
          author_link: "/#{response.user.info.username}"
          liked: false
          status:
            is_live: true
            live:
              started_at: "2015-04-24T17:08:40.000Z"

    create: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'rooms/create', data, on_status_code

      request.error on_error "rooms/create", callback

      request.done ( response ) ->

        callback  null, response

    update: ( id, data, callback ) ->
      request = $.put api_url + "rooms/#{id}", data

      request.error on_error "rooms/#{id} PUT", callback

      request.done ( response ) ->
        log "[Loopcast] request done", response
        callback  null, response

    delete: ( id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.delete api_url + "rooms/#{id}"

      request.error on_error "rooms/#{id} DELETE", callback

      request.done ( response ) ->
        log "[Loopcast] request done", response
        callback  null, response

    like: ( room_id, callback ) ->
      request = $.put api_url + "rooms/#{room_id}/like", {}

      request.error on_error "rooms/#{room_id}/like", callback

      request.done ( response ) ->
        callback  null, response

    dislike: ( room_id, callback ) ->
      request = $.put api_url + "rooms/#{room_id}/dislike", {} 

      request.error on_error "rooms/#{room_id}/dislike", callback

      request.done ( response ) ->
        callback  null, response

    start_stream: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = room_id: room_id

      request = $.post api_url + 'stream/start', data, on_status_code

      request.error on_error "stream/start", callback

      request.done ( response ) ->

        callback  null, response

    stop_stream: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        412: ( response ) -> callback 'Room not found or user not owner!'

      data = room_id: room_id

      request = $.post api_url + 'stream/stop', data, on_status_code

      request.error on_error "stream/stop", callback

      request.done ( response ) ->

        callback  null, response

    start_recording: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        412: ( response ) -> callback 'Room not found or user not owner!'

      data = room_id: room_id

      request = $.post api_url + 'tape/start', data, on_status_code

      request.error on_error "tape/start", callback

      request.done ( response ) ->

        callback  null, response

    stop_recording: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = room_id: room_id

      request = $.post api_url + 'tape/stop', data, on_status_code

      request.error on_error "tape/stop", callback

      request.done ( response ) ->

        callback  null, response

  chat:
    message: ( data, callback ) ->

      on_status_code =
        400: -> callback 'bad request'
        401: -> callback 'unauthorized'
        500: -> callback 'server error'

      request = $.post api_url + 'chat/message', data, on_status_code

      request.error on_error "chat/message", callback

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

      request.error on_error "user/edit", callback

      request.done ( response ) ->

        callback  null, response

    status: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'user/status', data, on_status_code

      request.error on_error "user/status", callback

      request.done ( response ) ->

        callback  null, response

    follow: ( username, callback ) ->
      request = $.put api_url + "user/#{username}follow", data

      request.error on_error "user/#{username}follow", callback

      request.done ( response ) ->
        log "[Loopcast] request done", response
        callback  null, response

    unfollow: ( username, callback ) ->
      request = $.put api_url + "user/#{username}unfollow", data

      request.error on_error "user/#{username}unfollow", callback

      request.done ( response ) ->
        log "[Loopcast] request done", response
        callback  null, response

    is_following: ( ids, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = ids: [].concat( ids ) # ids parameter can be 1 id or Array of ids

      request = $.post api_url + 'user/is_following', data, on_status_code

      request.error on_error "user/is_following", callback

      request.done ( response ) ->

        callback  null, response