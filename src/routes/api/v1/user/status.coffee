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

      if request.auth.isAuthenticated
        reply logged: true

      else
         reply logged: false