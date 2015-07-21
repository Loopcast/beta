slug = require 'slug'
Room = schema 'room'

module.exports =
  method : 'POST'
  path   : '/api/v1/tape/start'

  config:

    description: "Start stream"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' }
      { code: 410, message: "Room not found or user not owner" }
      { code: 412, message: "Database error" }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        room_id : joi.string().required()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id = req.auth.credentials.user._id
      room_id = req.payload.room_id

      query =
        _id  : room_id
        user : user_id

      Room.findOne( query )
        .select( "_id user" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          update =
            'status.is_recording'         : true
            'status.recording.started_at' : now().format()


          data =
            url: "#{s.tape.url}:8000/api/v1/start"
            form:
              room_id    : room_id 
              mount_point: String( room.user )

          request.post data, ( error, response, body ) ->

            if error or response.statusCode != 200

              console.log "error contacting server tape"
              console.log error

              return reply Boom.resourceGone( "could not connect to tape recorder" )

            if response.error

              console.log "error on the tape server while trying to record"
              console.log error

              return reply Boom.preconditionFailed( "Database error" )

            # JSON from tape server
            body = JSON.parse body

            update[ 'recording.file' ] = body.file
            
            Room.update( _id: room_id, update )
              .lean()
              .exec ( error, docs_updated ) ->

                if error

                  failed req, reply, error

                  return reply Boom.preconditionFailed( "Database error" )

                reply update