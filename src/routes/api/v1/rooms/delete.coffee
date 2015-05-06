slug = require 'slug'
Room = schema 'room'
extract_id   = lib 'cloudinary/extract_id'
delete_image = lib 'cloudinary/delete'

module.exports =
  method : 'DELETE'
  path   : '/api/v1/rooms/{id}'

  config:
    description: "Edit a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 410, message: 'Gone' } # Boom.resourceGone
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

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

          if not room

            return reply Boom.resourceGone();

          if room.info.cover_url
              
            current_id = extract_id room.info.cover_url

            delete_image current_id, ( error, result ) ->
              if error
                console.log "error deleting old cover from cloudinary"
                console.log error
              else
                console.log 'succesfully deleted old cover from cloudinary'
                console.log result

          Room.remove _id: room_id, ( error ) ->

            if error

              failed req, reply, error

              return reply Boom.preconditionFailed( "Error deleting document" )

            reply ok: 1