template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/{profile}/r/{slug}'

  config:

    description: "Render a template for a recorded tape"
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]

    handler: ( request, reply )->

      # if not authenticated, must check if the room is live
      # if not live should return a 404
      # if !request.auth.isAuthenticated

      model = aware {}

      profile = request.params.profile
      slug    = request.params.slug

      find( 'users/by/username' ) profile, '_id', ( error, user ) ->

        if error
          return reply Boom.badImplementation( error.message, error )

        console.log 'user id ->', user._id


        query =
          user    : user._id
          slug    : slug
          deleted : false

        Tape.findOne( query )

          .populate( 'user', 'info.avatar info.username info.name' )
          .sort( _id: -1 )
          .lean()
          .exec ( error, tape ) -> 

            if error then return failed request, reply, error

            # if tape doesn't exist
            if not tape then return reply( "Page not found" ).code 404

            template '/profile/tape', tape: tape, ( error, response ) ->

              if not error then return reply response

              reply( "Page not found" ).code 404