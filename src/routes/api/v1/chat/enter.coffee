escape = require 'escape-html'


module.exports =
  method : 'GET'
  path   : '/api/v1/chat/{id}/enter'

  config:

    description: "Adds user to chat list"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      user     = request.auth.credentials.user
      room_id  = request.params.room_id

      User
        .findOne( _id: user._id )
        .select( "socket_id info.name info.username info.occupation info.avatar likes" )
        .lean()
        .exec ( error, response ) ->

          if error then return reply Boom.badRequest "user not found"
          
          console.log "[Api] chat:enter", response.socket_id
          data = 
            type  : "listener:added"
            method: 'added'
            user : 
              id        : user._id
              socket_id : response.socket_id
              username  : response.info.username
              name      : response.info.name
              occupation: response.info.occupation
              avatar    : response.info.avatar
              followers : response.info.likes
              url       : "/" + response.info.username

          console.log "[Api] chat:enter #2", data

          sockets.send room_id, data

          reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"