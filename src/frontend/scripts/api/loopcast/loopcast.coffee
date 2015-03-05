api_url = "/api/v1/"

module.exports = 
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