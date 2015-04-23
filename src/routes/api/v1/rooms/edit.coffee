slug = require 'slug'
Room = schema 'room'

module.exports =
  method : 'PUT'
  path   : '/api/v1/rooms/{id}'

  config:
    description: "Edit a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        title     : joi.string()
        location  : joi.string()
        about     : joi.string()
        cover_url : joi.string()
        genres    : joi.array()
        is_public : joi.boolean()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      username = req.auth.credentials.user.username
      room_id  = req.params.id
      payload  = req.payload

      query =
        _id: room_id
        'info.user' : username

      Room.findOne( query )
        .select( "_id" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          update = {}
          
          if payload.title
            update[ 'info.title' ] = payload.title
            update[ 'info.slug' ]  = slug payload.title.toLowerCase()

          if payload.location
            update[ 'info.location' ] = payload.location

          if payload.about
            update[ 'info.about' ] = payload.about

          if payload.cover_url
            update[ 'info.cover_url' ] = payload.cover_url

          if payload.genres
            update[ 'info.genres' ] = payload.genres

          if payload.is_public
            update[ 'status.is_public' ] = payload.is_public


          Room.update( _id: room_id, update )
            .lean()
            .exec ( error, docs_updated ) ->

              if error

                failed req, reply, error

                return reply Boom.preconditionFailed( "Database error" )

              reply update