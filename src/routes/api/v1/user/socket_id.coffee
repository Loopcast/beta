like = lib 'user/like'

module.exports =
  method : 'PUT'
  path   : '/api/v1/user/socket_id/{socket_id}'

  config:
    description: "Start following a user"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id   = req.auth.credentials.user._id
      socket_id = req.params.socket_id

      update    = $set: 'socket_id': socket_id

      User.update _id: user_id, update, ( error, result ) ->

        if error 
          console.log "error while updating user on mongodb"
          console.log user

          return reply Boom.badData 'error updating socket_id for user #{user_id}'

        reply result