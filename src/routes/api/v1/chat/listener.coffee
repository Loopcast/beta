escape = require 'escape-html'

load_profile = models 'profile'

module.exports =
  method : 'POST'
  path   : '/api/v1/chat/listener'

  config:

    description: """
    Sends a message when a listener gets in or out to the chat room
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        method   : joi.string().required()
        room_id  : joi.string().required()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated
        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user

      room_id  = request.payload.room_id

      User
        .findOne( _id: user._id )
        .select( "info.name info.username info.occupation info.avatar likes" )
        .lean()
        .exec ( error, response ) ->

          if error then return reply Boom.badRequest "user not found"

          data = 
            type  : "listener:#{request.payload.method}"
            method: request.payload.method
            user : 
              id        : response.info.username
              name      : response.info.name
              occupation: response.info.occupation
              avatar    : response.info.avatar
              followers : response.info.likes
              url       : "/" + response.info.username

          sockets.send room_id, data

          reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"

