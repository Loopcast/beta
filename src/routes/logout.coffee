###

Logs user out

###

module.exports =
  method : [ 'GET' ]
  path   : '/logout'
  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      if request.auth.isAuthenticated
        request.auth.session.clear()
        # ∞

      reply.redirect '/'