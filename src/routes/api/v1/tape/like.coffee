like      = lib 'likes/add'
set_liked = lib 'renotifier/set_liked'

module.exports =
  method : 'PUT'
  path   : '/api/v1/tape/{id}/like'

  config:
    description: "Like a tape in case it wasnt linked before"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized( 'needs authentication' )

      user    = req.auth.credentials.user
      tape_id = req.params.id

      data = 
        type     : 'like'
        user_id  : user._id
        username : user.username
        name     : user.name
        avatar   : user.avatar

      sockets.send tape_id, data

      like user._id, Tape, tape_id, ( error, respose ) ->

        if error
          return reply Boom.badImplementation( error.message, error )
        
        reply respose

      Tape
        .findOne( _id = tape_id )
        .select( "slug user" )
        .populate( "user", "_id info.slug" )
        .lean().exec ( error, tape ) ->

          set_liked user.name, tape.slug, tape.user