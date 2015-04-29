escape = require 'escape-html'
pusher_utils = lib 'shared/pusher_utils'
transform = lib 'shared/transform'

load_profile = models 'profile'

module.exports =
  method : 'POST'
  path   : '/api/v1/chat/listener'

  config:

    description: "Sends a message when a listener gets in or out to the chat room"
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
      room_subscribe_id    = pusher_utils.get_room_subscribe_id owner_id, room_id

      load_profile user.username, ( error, user_data ) ->

        data = 
          method: request.payload.method
          user : 
            id: user_data.id
            name: user_data.name
            occupation: user_data.occupation
            images: user_data.images
            followers: user_data.followers
            url: "/" + user_data.id

        response = pusher.trigger room_subscribe_id, "listener:#{data.method}", data

        reply( response ).header "Cache-Control", "no-cache, must-revalidate"

