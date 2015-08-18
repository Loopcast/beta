###

succesfully logged users get redirect to this url.
the url then renders a template using the user
credentials

###

template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/login/successful'
  config:
    auth:
      strategy: 'session'
      mode    : 'try'

  handler: ( request, reply )->

    # if user is not logged, redirect to explore page
    if not request.auth.isAuthenticated then return reply.redirect '/login'

    url = request.url.pathname

    # follows just the bare minimun information needed
    data = request.auth.credentials

    template url, data, ( error, response ) ->

      if not error then return reply response

      reply error