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

      user_id  = req.auth.credentials.user._id
      username = req.auth.credentials.user.username
      room_id  = req.payload.room_id

      query =
        _id  : room_id
        user : user_id

      Room.findOne( query )
        .select( "_id user info.slug info.title recording" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          # this must be fixed better
          # if room.recording 

            # return reply Boom.preconditionFailed( "Still recording or uploading, please stop recording or wait upload complete" )

          # creating new recording document
          doc = 
            user      : user_id
            room      : room_id
            title     : room.info.title
            genres    : room.info.genres
            location  : room.info.location
            about     : room.info.about
            cover_url : room.info.cover_url

          recording = new Tape doc

          recording.save ( error, doc ) ->

            if error 
              console.log "error creating tape document"
              console.log error
              
              return failed req, reply, error

            update =
              # sets recording._id to the recording parent @ room
              recording                     : doc._id
              'status.is_recording'         : true
              'status.recording.started_at' : now().format()

            # set the filename on the tape recording
            rec_update =
              started_at: update['status.recording.started_at']

            Tape
              .update( _id: recording._id, rec_update )
              .lean()
              .exec ( error, docs_updated ) ->

                if error 
                  console.log "error updating tape document"
                  console.log error
                  
                  return failed req, reply, error

            data =
              url: "#{s.tape.url}/api/v1/start"
              form:
                path    : "http://cdn.audiopump.co/loopcast-staging/#{username}_#{room.info.slug}"
                tape    : doc._id.toString()
                title   : room.info.slug
                username: username

            if s.is_beta
              data.form.path = "http://cdn.audiopump.co/loopcast/#{username}_#{room.info.slug}"

            request.post data, ( error, response, body ) ->

              if error or response.statusCode != 200

                console.log "error contacting server tape"
                console.log error
                console.log body

                return reply Boom.resourceGone( "could not connect to tape recorder" )

              if response.error

                console.log "error on the tape server while trying to record"
                console.log error

                return reply Boom.preconditionFailed( "Database error" )

              # update[ 'status.recording.file' ] = body.file
              
              Room.update( _id: room_id, update )
                .lean()
                .exec ( error, docs_updated ) ->

                  if error

                    failed req, reply, error

                    return reply Boom.preconditionFailed( "Database error" )

                  reply update