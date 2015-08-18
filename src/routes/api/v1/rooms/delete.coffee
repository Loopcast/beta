slug = require 'slug'
Room = schema 'room'

extract_id   = lib 'cloudinary/extract_id'
delete_image = lib 'cloudinary/delete'
delete_file  = lib 's3/delete'

delete_likes = lib 'rooms/delete_likes'

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

      user_id  = req.auth.credentials.user._id
      room_id  = req.params.id
      payload  = req.payload

      query =
        _id  : room_id
        user : user_id

      Room.findOne( query )
        .select( "_id info.cover_url status.recording.s3" )
        .lean()
        .exec ( error, room ) -> 

          if not room

            return reply Boom.resourceGone();

          # delete cover image from cloudinary
          if room.info.cover_url
              
            current_id = extract_id room.info.cover_url

            delete_image current_id, ( error, result ) ->
              if error
                console.log "error deleting old cover from cloudinary"
                console.log error
              # else
              #   console.log 'succesfully deleted old cover from cloudinary'
              #   console.log result

          # delete recorded set from s3
          if room.status.recording?.s3

            delete_file room.status.recording.s3.key, ( error, callback ) ->

              if error
                console.log "error deleting from s3!!"
                console.log error
                return

          delete_likes room_id, ( error ) ->

            if error
              console.log 'failed to delete likes for room #{id}'
              console.log error

          Room.remove _id: room_id, ( error ) ->

            if error

              failed req, reply, error

              return reply Boom.preconditionFailed( "Error deleting document" )

            reply ok: 1