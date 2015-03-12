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

      Room.findOne( { } )
        .where( "url"  , "#{profile}/#{room_id}" )
        .select( "info" )
        .sort( _id: -1 )
        .lean()
        .exec ( error, room ) -> 

          if error then return failed request, reply, error

          model.set 'room', room

          # if is authenticated and owner of the room
          # render the room
          if request.auth.isAuthenticated

            data = request.auth.credentials

            if room.info.owner_user == data.user.username

              data.room = model.get 'room'

              template '/rooms/create', data, ( error, response ) ->

                if not error then return reply response

                reply( "Page not found" ).code 404

              return

          if not room.status?.is_live

            return reply( "Page not found" ).code 404

          console.log "found room!"


          model.set 'room', room

      return

      response = ->

        return if not model.get 'user'
        return if not model.get 'room'

        # always inject user data into requests
        data = request.auth.credentials || {}
        data.room  = model.get 'room'
        data.owner = model.get 'user'

        template '/profile/room', data, ( error, response ) ->

          if not error then return reply response

          reply( "Page not found" ).code 404



      model.on 'user', response
      model.on 'room', response



      Room.find( { } )
        .where( "url"  , "#{profile}/#{room_id}" )
        .select( "info" )
        .lean()
        .exec ( error, room ) -> 

          if error then return failed request, reply, error

          model.set 'room', room

      User.find( { }, _id: off )
        .where( 'info.username', profile )
        .select( 'info' )
        .lean()
        .exec( error, user ) -> 

          if error then return failed request, reply, error

          model.set 'user', user