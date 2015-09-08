socket_entered_room = lib 'sockets/room/enter'

escape = require 'escape-html'

module.exports =
  method : 'POST'
  path   : '/api/v1/chat/{room_id}/enter'

  config:

    description: "Broadcast listener:added message to chat list"
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

    handler: ( req, reply ) ->

      room_id  = req.params.room_id

      if not req.auth.isAuthenticated

        user = 
          _id      : req.payload.user._id
          socket_id: req.payload.user.socket_id
          info:
            username : req.payload.user.info.username
            name     : req.payload.user.info.name
            avatar   : s.default.chat_avatar

        # guests have to send their user information
        # this can lead to some "add use exploit"
        socket_entered_room room_id, user, true

        reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"

      # fetch user information from database
      if req.auth.isAuthenticated

        user     = req.auth.credentials.user

        User
          .findOne( _id: user._id )
          .select( "socket_id info.name info.username info.occupation info.avatar likes" )
          .lean()
          .exec ( error, user ) ->

            if error then return reply Boom.badRequest "user not found"

            socket_entered_room room_id, user

            reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"