template = lib 'render/template'

Room     = schema 'room'
User     = schema 'user'

module.exports =
  method: 'GET'
  path  : '/{profile}/{room}'

  config:

    # auth:
    #   strategy: 'session'
    #   mode    : 'try'

    handler: ( request, reply )->

      # if not authenticated, must check if the room is live
      # if not live should return a 404
      # if !request.auth.isAuthenticated

      model = aware {}

      profile = request.params.profile
      room_id = request.params.room

      query =
        'info.user'       : profile
        'info.slug'       : room_id

      Room.findOne( query )
        .select( "user info status" )
        .populate( 'user', 'info.avatar info.username info.name' )
        .sort( _id: -1 )
        .lean()
        .exec ( error, room ) -> 

          if error then return failed request, reply, error

          # if room doesn't exist redirect to user profile
          if not room 

            reply.redirect( "/#{profile}" )

            return

          
          # room.info.images = transform.all_cover room.info.cover_url

          model.set 'room', room

          User
            .findById( room.user )
            .select( "info" )
            .lean().exec  ( error, user ) ->

              if error
                console.log "error fetching user data"
                console.log response

                return reply Boom.badData 'error fetching user information'

              model.set 'user', user

      model.on 'user', ( user ) ->

        data =
          user: model.get 'user'
          room: model.get 'room'

        template '/profile/room', data, ( error, response ) ->

          if not error then return reply response

          reply( "Page not found" ).code 404