like = lib 'user/like'

module.exports =
  method : 'PUT'
  path   : '/api/v1/user/appcast/version/{version}'

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

      user_id = req.auth.credentials._id
      version = req.params.version

      query  = _id : user_id
      update = $set: 'data.appcast.version': version

      User.update query , update, ( error, result ) ->
        
        if error 
          console.log "error while updating user on mongodb"
          console.log user

          return reply Boom.badData 'error updating appcast version'

        reply result