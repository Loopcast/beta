escape = require 'escape-html'

get_messages   = lib 'chat/get_messages'

module.exports =
  method : 'GET'
  path   : '/api/v1/chat/messages/{room_id}'

  config:

    description: "Get latest messages for a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      get_messages request.params.room_id, ( error, response ) -> 

        if error then return reply Boom.resourceGone "Something went wrong"

        reply response