escape = require 'escape-html'


module.exports =
  method : 'GET'
  path   : '/api/v1/chat/{id}/leave'

  config:

    description: "Remove user from chat list"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->


      if not request.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user
      id   = request.params.room_id

      console.log "removing user #{user._id} from #{id}"

      console.log 'credentials user ->', user

      user =
        _id     : user._id
        username: user.username
        avatar  : user.avatar

      reply user

      # data = {

      # }
      # redis.hset "room:#{id}:members", user._id,

      # get_messages , ( error, response ) -> 

      #   if error then return reply Boom.resourceGone "Something went wrong"

      #   reply response