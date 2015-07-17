socket_entered_room = lib 'sockets/room/enter'

escape = require 'escape-html'

module.exports =
  method : 'GET'
  path   : '/api/v1/chat/{room_id}/enter'

  config:

    description: "Adds user to chat list"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    validate:
      payload:
        user : joi.any()

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      if not req.auth.isAuthenticated

        # guests have to send their user information
        # this can lead to some "add use exploit"
        socket_entered_room null, req.payload.user

        reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"

      # fetch user information from database
      if req.auth.isAuthenticated

        user     = request.auth.credentials.user
        room_id  = request.params.room_id

        User
          .findOne( _id: user._id )
          .select( "socket_id info.name info.username info.occupation info.avatar likes" )
          .lean()
          .exec ( error, user ) ->

            if error then return reply Boom.badRequest "user not found"

            socket_entered_room room_id, user

            reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"