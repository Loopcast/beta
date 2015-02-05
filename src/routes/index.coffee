###

Check if a jade template exists for a given address, if fails to find a 
template will look for a user profile, if fails will return a 404

###

template = lib 'render/template'
profile  = lib 'render/profile'

module.exports =
  method: 'GET'
  path  : '/'
  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      # if user is logged, redirect to explore page
      if request.auth.isAuthenticated then return reply.redirect '/people'
       
      url = '/index'

      template url, null, ( error, response ) ->

        if not error then return reply response

        reply error