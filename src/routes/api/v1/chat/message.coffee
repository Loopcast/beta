escape = require 'escape-html'

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
        user_id : joi.string().required()
        room_id : joi.string().required()
        message : joi.string().required()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user

      room    = request.payload.room_id
      user_id = request.payload.user_id

      # build channel string
      room    = "#{user_id}.#{room}"

      message = request.payload.message
      message = escape message

      data = 
        name   : user.name
        avatar : user.avatar
        time   : now().format()
        message: message

      response = pusher.trigger room, "message", data

      reply( response ).header "Cache-Control", "no-cache, must-revalidate"