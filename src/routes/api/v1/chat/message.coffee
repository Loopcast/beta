escape = require 'escape-html'
pusher_utils = lib 'shared/pusher_utils'

module.exports =
  method : 'POST'
  path   : '/api/v1/chat/message'

  config:

    description: "Sends a message to the chat room"
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
        owner_id        : joi.string().required()
        user_id         : joi.string().required()
        room_id         : joi.string().required()
        message         : joi.string().optional()
        additional_data : joi.object().optional()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated
        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user

      room    = request.payload.room_id
      owner_id = request.payload.owner_id
      user_id = request.payload.user_id

      # build channel string
      room_subscribe_id    = pusher_utils.get_room_subscribe_id owner_id, room

      data = 
        name   : user.name
        username: user_id
        avatar : user.avatar
        time   : now().format()
        message: escape request.payload.message

      if request.payload.additional_data?
        data.additional_data = request.payload.additional_data

      response = pusher.trigger room_subscribe_id, "message", data

      reply( response ).header "Cache-Control", "no-cache, must-revalidate"

