escape = require 'escape-html'
pusher_room_id = lib 'pusher/get_room_id'

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
        owner_id : joi.string().optional()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated
        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user

      room_id    = request.payload.room_id
      owner_id = request.payload.owner_id

      # build channel string
      room_subscribe_id    = pusher_room_id owner_id, room_id

      query = _id: user._id

      User
        .findOne( query )
        .select( "info.name info.username info.occupation info.avatar likes" )
        .lean()
        .exec ( error, response ) ->

          if error then return reply Boom.badRequest "user not found"

          data = 
            method: request.payload.method
            user : 
              id        : response.info.username
              name      : response.info.name
              occupation: response.info.occupation
              avatar    : response.info.avatar
              followers : response.info.likes
              url       : "/" + response.info.username

          response = pusher.trigger room_subscribe_id, "listener:#{data.method}", data

          reply( response ).header "Cache-Control", "no-cache, must-revalidate"

