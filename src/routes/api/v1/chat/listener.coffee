escape = require 'escape-html'
pusher_utils = lib 'shared/pusher_utils'
transform = lib 'shared/transform'

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

      data = 
        method: request.payload.method
        name   : user.name
        id: user.username
        url: "/" + user.username
        image : transform.chat_sidebar user.avatar


      response = pusher.trigger room_subscribe_id, "listener:#{data.method}", data

      console.log "triggering!", 
      console.log "room_subscribe_id", room_subscribe_id
      console.log "data", data

      reply( response ).header "Cache-Control", "no-cache, must-revalidate"

