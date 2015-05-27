escape = require 'escape-html'

pusher_room_id = lib 'pusher/get_room_id'
save_message   = lib 'chat/save_message'

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

      room_id    = request.params.room_id

      redis.lrange "#{room_id}:messages", 0, -1, ( error, response ) ->

        if error then return reply Boom.resourceGone "Something went wrong"

        reply response