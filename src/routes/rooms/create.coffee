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

      url = '/profile/room'

      # always inject user data into requests
      data = request.auth.credentials || {}

      # Getting the social for the user
      intercom.getUser user_id: data.user.username, ( error, response ) ->
        data.user.social = response.custom_attributes.social

        template url, data, ( error, response ) ->

          if not error then return reply response

          return reply( "Page not found" ).code 404