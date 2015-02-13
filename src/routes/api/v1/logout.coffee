###

Logs user out

###

module.exports =
  method : [ 'POST' ]
  path   : '/api/v1/logout'
  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      if request.auth.isAuthenticated
        request.auth.session.clear()
        # ∞
        reply success: true

      else
         reply error: code: 'not_logged'
