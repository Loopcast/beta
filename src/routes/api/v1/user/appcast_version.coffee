like = lib 'user/like'

module.exports =
  method : 'POST'
  path   : '/api/v1/user/appcast_version'

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

      user_id = req.auth.credentials.user._id
      version = req.payload.version
      build   = req.payload.build

      query  = _id : user_id
      update = $set: 'data.appcast': req.payload

      User.update query , update, ( error, result ) ->

        if error 
          console.log "error while updating user on mongodb"
          console.log user

          return reply Boom.badData 'error updating appcast version'

        reply result


      console.log 'got data ->', req.payload

      # update information on intercom
      user_data = 
        user_id           : user_id
        custom_attributes :
          appcast_version: version
          appcast_build  : build

      intercom.updateUser user_data, ( error, res ) ->

        if error 
          console.log "error while updating user on intercom"
          console.log user

          return