###

Check if a jade template exists for a given address, if fails to find a 
template will look for a user profile, if fails will return a 404

###

template = lib 'render/template'
profile  = lib 'render/profile'

module.exports =
  method: 'GET'
  path  : '/{page*}'

  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      url = request.url.pathname

      render = ( response ) -> reply response

      # always inject user data into requests
      data = request.auth.credentials || {}

      template url, data, ( error, response ) ->

        if not error then return render response

        profile url, data, ( error, response ) ->

          if not error then return render response

          return reply( "Page not found" ).code 404