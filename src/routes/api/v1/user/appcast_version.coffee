like = lib 'user/like'

module.exports =
  method : 'POST'
  path   : '/api/v1/user/appcast_version'

  config:
    description: "Updates user appcast version on the database"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        build   : joi.number()
        version : joi.string()
        os      : joi.string()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id = req.auth.credentials.user._id
      version = req.payload.version
      build   = req.payload.build
      os      = req.payload.os

      query  = _id : user_id
      update = 
        $set: 
          'data.appcast.version': version
          'data.appcast.build'  : build
          'data.appcast.os'     : os

      User.update query , update, ( error, result ) ->

        if error 
          console.log "error while updating user on mongodb"
          console.log user

          return reply Boom.badData 'error updating appcast version'

        reply result

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