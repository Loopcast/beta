template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/{profile}/r/{slug}'

  config:

    description: "Render a template for a recorded tape"
    
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( req, reply )->

      if req.auth.isAuthenticated
        visitor = req.auth.credentials.user

      model = aware {}

      profile = req.params.profile
      slug    = req.params.slug

      find( 'users/by/username' ) profile, '_id', ( error, user ) ->

        if error
          return reply Boom.badImplementation( error.message, error )

        query =
          user    : user._id
          slug    : slug
          deleted : false

        # if it's not the owner of the set, then only display if public
        is_guest = ( !visitor || visitor._id is not user._id )

        if is_guest then query.public = true 
          

        Tape.findOne( query )
          .populate( 'user', 'info.avatar info.username info.name' )
          .sort( _id: -1 )
          .lean()
          .exec ( error, tape ) -> 

            if error then return failed req, reply, error

            # if tape doesn't exist
            if not tape then return reply( "Page not found" ).code 404

            query =
              liked_id : tape._id
              end      : $exists: false

            Like.find( query )
              .populate( 'user_id', 'info.avatar info.username info.name' )
              .sort( _id: -1 )
              .lean()
              .exec ( error, favourited_by ) ->

                data =
                  tape         : tape
                  favourited_by: favourited_by

                template '/profile/tape', data, ( error, response ) ->

                  if not error then return reply response

                  reply( "Page not found" ).code 404