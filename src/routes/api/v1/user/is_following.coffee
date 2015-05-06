###

Updates user's profile information

###

User = schema 'user'

module.exports =
  method : 'POST'
  path   : '/api/v1/user/is_following'

  config:
    description: "Receives a list of ids and return just the ones being followed"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 409, message: 'Error updating user name ' } # Boom.conflict
      { code: 422, message: 'Error fetching user information' } # Boom.badData
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        ids  : joi.array().required()

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized 'needs authentication'

      user    = request.auth.credentials.user
      payload = request.payload

      reply payload.ids