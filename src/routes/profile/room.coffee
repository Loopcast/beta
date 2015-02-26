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

      model = aware {}
      model.on 'user', response
      model.on 'room', response

      profile = request.params.profile
      room_id = request.params.room

      Room.find( { } )
        .where( "url"  , "#{profile}/#{room_id}" )
        .select( "info" )
        .lean()
        .exec ( error, room ) -> 

          if error then return failed request, reply, error

          aware.set 'room', room

      User.find( { }, _id: off )
        .where( 'info.username', profile )
        .select( 'info' )
        .lean()
        .exec( error, user ) -> 

          if error then return failed request, reply, error

          aware.set 'user', user