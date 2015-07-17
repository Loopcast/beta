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

        callback? null, response

  rooms :

    is_available: ( title, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        
      data = title: title

      request = $.post api_url + 'rooms/is_available', data, on_status_code

      request.error on_error "rooms/is_available", callback

      request.done ( response ) ->

        callback? null, response

    info: (room_id, callback ) ->

      request = $.get api_url + "rooms/#{room_id}/info"

      request.error on_error "rooms/#{room_id}/info", callback

      request.done ( response ) ->

        callback null, response

    stats: (room_id, callback ) ->

      request = $.get api_url + "rooms/#{room_id}/stats"

      request.error on_error "rooms/#{room_id}/stats", callback

      request.done ( response ) ->

        callback null, response

    create: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'rooms/create', data, on_status_code

      request.error on_error "rooms/create", callback

      request.done ( response ) ->

        callback? null, response

    play: ( room_id, callback ) ->
      request = $.put api_url + "rooms/#{room_id}/play"

      request.error on_error "rooms/#{room_id}/play PUT", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    visit: ( room_id, callback ) ->
      request = $.put api_url + "rooms/#{room_id}/visit"

      request.error on_error "rooms/#{room_id}/visit PUT", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    update: ( id, data, callback ) ->
      request = $.put api_url + "rooms/#{id}", data

      request.error on_error "rooms/#{id} PUT", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    delete: ( id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.delete api_url + "rooms/#{id}"

      request.error on_error "rooms/#{id} DELETE", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    like: ( room_id, callback ) ->
      request = $.put api_url + "rooms/#{room_id}/like", {}

      request.error on_error "rooms/#{room_id}/like", callback

      request.done ( response ) ->
        callback? null, response

    dislike: ( room_id, callback ) ->
      request = $.put api_url + "rooms/#{room_id}/unlike", {} 

      request.error on_error "rooms/#{room_id}/unlike", callback

      request.done ( response ) ->
        callback? null, response

    start_stream: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = room_id: room_id

      request = $.post api_url + 'stream/start', data, on_status_code

      request.error on_error "stream/start", callback

      request.done ( response ) ->

        callback? null, response

    stop_stream: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        412: ( response ) -> callback 'Room not found or user not owner!'

      data = room_id: room_id

      request = $.post api_url + 'stream/stop', data, on_status_code

      request.error on_error "stream/stop", callback

      request.done ( response ) ->

        callback? null, response

    start_recording: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'
        412: ( response ) -> callback 'Room not found or user not owner!'

      data = room_id: room_id

      request = $.post api_url + 'tape/start', data, on_status_code

      request.error on_error "tape/start", callback

      request.done ( response ) ->

        callback? null, response

    stop_recording: ( room_id, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = room_id: room_id

      request = $.post api_url + 'tape/stop', data, on_status_code

      request.error on_error "tape/stop", callback

      request.done ( response ) ->

        callback? null, response

  chat:
    message: ( data, callback ) ->

      on_status_code =
        400: -> callback 'bad request'
        401: -> callback 'unauthorized'
        500: -> callback 'server error'

      request = $.post api_url + 'chat/message', data, on_status_code

      request.error on_error "chat/message", callback

      request.done ( response ) ->

        callback? null, response

    messages : (room_id, callback) ->

      on_status_code =
        400: -> callback 'bad request'
        401: -> callback 'unauthorized'
        500: -> callback 'server error'

      request = $.get api_url + 'chat/messages/' + room_id, {}, on_status_code

      request.error on_error "chat/messages", callback

      request.done ( response ) ->

        callback? null, response
    
    people: ( room_id, callback ) ->
      request = $.get api_url + "chat/#{room_id}/people"

      request.error on_error "chat/#{room_id}/people", callback

      request.done ( response ) ->

        callback null, response

    enter: ( data, callback ) ->

      request = $.post api_url + "chat/#{data.room_id}/enter", user: data.user

      request.error on_error "chat/#{data.room_id}/enter", callback

      request.done ( response ) ->

        callback null, response
        
  user:
    edit: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'user/edit', data, on_status_code

      request.error on_error "user/edit", callback

      request.done ( response ) ->

        callback? null, response

    socket_id: ( socket_id, callback ) ->
      request = $.put api_url + "user/socket_id/#{socket_id}"

      request.error on_error "user/socket_id/#{socket_id}", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    status: ( data, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      request = $.post api_url + 'user/status', data, on_status_code

      request.error on_error "user/status", callback

      request.done ( response ) ->

        callback? null, response

    follow: ( user_id, callback ) ->
      request = $.put api_url + "user/#{user_id}/follow"

      request.error on_error "user/#{user_id}/follow", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    appcast_version: ( version, callback ) ->
      request = $.put api_url + "user/appcast/version/#{version}"

      request.error on_error "user/appcast/version/#{version}", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    unfollow: ( user_id, callback ) ->
      request = $.put api_url + "user/#{user_id}/unfollow"

      request.error on_error "user/#{user_id}/unfollow", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    following: ( callback ) ->
      request = $.post api_url + "user/following"

      request.error on_error "user/following", callback

      request.done ( response ) ->
        # log "[Loopcast] request done", response
        callback? null, response

    is_following: ( ids, callback ) ->
      on_status_code =
        401: ( response ) -> callback 'unauthorized, need log in!'

      data = ids: [].concat( ids ) # ids parameter can be 1 id or Array of ids

      request = $.post api_url + 'user/is_following', data, on_status_code

      request.error on_error "user/is_following", callback

      request.done ( response ) ->

        callback? null, response