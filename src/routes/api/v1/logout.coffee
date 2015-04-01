module.exports =
  method : 'POST'
  path   : '/api/v1/logout'

  config:

    description: "Logs user out and clear user session"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    response: schema:
      error   : joi.object().keys
        code: joi.string()
      success : joi.boolean()

    handler: ( request, reply ) ->

      if request.auth.isAuthenticated
        request.auth.session.clear()
        # ∞
        reply success: true

      else
         reply error: code: 'not_logged'