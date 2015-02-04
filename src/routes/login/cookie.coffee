module.exports = 
  method : ['GET', 'POST']
  path   : '/login/cookie'
  config :
    auth:
        mode: 'try',
        strategy: 'session'
    plugins:
        'hapi-auth-cookie': redirectTo: false
    handler: ( request, reply ) ->

      if request.auth.isAuthenticated
        reply "Authenticated!"
      else
        reply "Not Authenticated!"
