module.exports =
  method : 'POST'
  path   : '/api/v1/user/status'

  config:

    description: "Check if the user is logged"
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      # true if logged in, false if not logged
      reply logged: request.auth.isAuthenticated