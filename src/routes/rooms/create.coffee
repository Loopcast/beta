###

Check if a jade template exists for a given address, if fails to find a 
template will look for a user profile, if fails will return a 404

###

template = lib 'render/template'
User     = schema 'user'

add_mount_point = lib 'icecast/add_mount_point'

module.exports =
  method: 'GET'
  path  : '/rooms/create'

  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( req, reply )->

      # TODO: check if the user is authenticated

      url = '/profile/room'

      # always inject user data into reqs
      data = req.auth.credentials

      if not data

        return template url, data, ( error, response ) ->

          if not error then return reply response

          return reply( "Page not found" ).code 404

      User
        .findById( data.user._id )
        .lean().exec  ( error, user ) ->

          # dumps full user for the frontend
          # TODO: optimise and only bring needed fields
          data.user = user;

          template url, data, ( error, response ) ->

            if not error then return reply response

            return reply( "Page not found" ).code 404