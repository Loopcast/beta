api_url = "/api/v1/"

module.exports = 
  room :
    create: ( data, callback ) ->
      request = $.post api_url + 'room/create', data

      request.error ( error ) ->

        console.error 'error creating calling create/room'
        console.error error

        callback error

      request.done ( response ) ->

        console.info 'success creating room'
        console.info 'got response ->', response

        callback  null, response