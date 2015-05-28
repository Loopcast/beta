escape = require 'escape-html'

module.exports =
  method : 'POST'
  path   : '/api/v1/chat/auth'

  config:

    description: "Authenticates user for presence channel"
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
        socket_id    : joi.string().required()
        channel_name : joi.string().required()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated
        return reply Boom.unauthorized('needs authentication')

      user = req.auth.credentials.user

      socket_id    = req.payload.socket_id
      channel_name = req.payload.channel_name

      data = 
        user_id: user.username
        user_info:
          name    : user.name
          avatar  : user.avatar
          _id     : user._id

      # reply with pusher authentication
      reply pusher.authenticate socket_id, channel_name, data


