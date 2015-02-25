###

Check if a jade template exists for a given address, if fails to find a 
template will look for a user profile, if fails will return a 404

###

template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/rooms/create'

  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      url = '/rooms/create'

      # always inject user data into requests
      data = request.auth.credentials || {}

      template url, data, ( error, response ) ->

        if not error then return reply response

        return reply( "Page not found" ).code 404