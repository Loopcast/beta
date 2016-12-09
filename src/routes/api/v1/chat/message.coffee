send = lib 'chat/messages/send'

module.exports =
  method : 'POST'
  path   : '/api/v1/chat/message'

  config:

    description: """"
      Sends a message to the chat room
      TODO: rename to /api/v1/chat/message/send
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1", "todo" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        room_id : joi.string().required()
        message : joi.string().optional()
        payload : joi.object().optional()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated
        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user

      room_id  = request.payload.room_id
      user_id  = request.payload.user_id

      data =
        type    : 'message'
        _id     : user._id
        name    : user.name
        username: user.username
        avatar  : user.avatar
        time    : now().format()
        message : request.payload.message
        payload : request.payload.payload

      # send message
      send room_id, data

      reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"

