slug = require 'slug'
Room = schema 'room'
extract_id = lib 'cloudinary/extract_id'

module.exports =
  method : 'DELETE'
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
        .select( "_id info.cover_url" )
        .lean()
        .exec ( error, room ) -> 

          if room.info.cover_url
              
            current_id = extract_id room.info.cover_url

            cloudinary.api.delete_resources [ current_id ], ( result ) ->
              if result.error
                console.log "error deleting old cover from cloudinary"
                console.log result.error
              else
                console.log 'succesfully deleted old cover from cloudinary'
                console.log result

          Room.remove _id: room_id, ( error ) ->

            if error

              failed req, reply, error

              return reply Boom.preconditionFailed( "Error deleting document" )

            reply ok: 1