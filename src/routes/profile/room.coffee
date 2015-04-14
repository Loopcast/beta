template = lib 'render/template'
profile  = lib 'render/profile'

Room     = schema 'room'

module.exports =
  method: 'GET'
  path  : '/{profile}/{room}'

  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      # if not authenticated, must check if the room is live
      # if not live should return a 404
      # if !request.auth.isAuthenticated

      model = aware {}

      profile = request.params.profile
      room_id = request.params.room


      console.log "looking for room #{profile}/#{room_id}"

      query =
        'info.user'       : profile
        'info.slug'       : room_id
        'status.is_public': on

      Room.findOne( query )
        .select( "info.title status.is_streaming" )
        .sort( _id: -1 )
        .lean()
        .exec ( error, room ) -> 

          if error then return failed request, reply, error

          # if room doesn't exist
          if not room then return reply( "Page not found" ).code 404

          # if not authenticated
          if not request.auth.isAuthenticated

            # and not live
            if not room.status?.is_streaming

              # return 404
              return reply( "Page not found" ).code 404

          model.set 'room', room

          # TODO: get user from the database and return real data
          model.set 'user',
            'info.name': profile
            username   : profile

          return

          # find user in order to return user name
          User.find( { }, _id: off )
            .where( 'info.username', profile )
            .select( 'info' )
            .lean()
            .exec( error, user ) -> 

              if error then return failed request, reply, error

              model.set 'user', user

      model.on 'user', ( user ) ->

        data =
          user: model.get 'user'
          room: model.get 'room'

        console.log 'data ->', data

        # if is authenticated and owner of the room
        # render the room
        if request.auth.isAuthenticated

          if data.room.info.owner_user == data.user.username

            template '/profile/room', data, ( error, response ) ->

              if not error then return reply response

              reply( "Page not found" ).code 404

            return

        template '/profile/room', data, ( error, response ) ->

          if not error then return reply response

          reply( "Page not found" ).code 404