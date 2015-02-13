###

Logs user out

###

module.exports =
  method : [ 'GET', 'POST' ]
  path   : '/logout'
  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      if request.auth.isAuthenticated
        request.auth.session.clear()
        # ∞
        if request.method is "post"
          reply success: true
        else
          reply.redirect '/'

      else
        if request.method is "post"
          reply error: code: 'not_logged'
        else
          reply.redirect '/'