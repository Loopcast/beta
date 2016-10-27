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

      # if for some reason a js file comes on this direction
      # return not found
      if url.indexOf( "/js" ) is 0
        return reply( "not found" ).code 404

      # always inject user data into requests
      data = request.auth.credentials || {}

      template url, data, ( error, response ) ->

        if not error then return reply response

        profile url, request.auth.credentials, ( error, response ) ->

          if not error then return reply response

          return reply( response ).code 404
