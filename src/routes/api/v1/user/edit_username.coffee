###

Updates user's profile information

###

module.exports =
  method : 'POST'
  path   : '/api/v1/user/edit/username'

  config:
    description: "Edit user username"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        username  : joi.string().required()

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized 'needs authentication'

      user   = request.auth.credentials.user

      update = 'info.username': slug request.payload.username

      User.update _id: user_id, update, ( error, result ) ->

        if error 
          console.log "error updating username for user #{user._id}"
          console.log user

          return reply Boom.badData "error updating username for user #{user._id}"

        reply ok: 1
