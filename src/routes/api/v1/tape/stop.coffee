slug = require 'slug'
Room = schema 'room'

mongoose = require 'mongoose'

module.exports =
  method : 'POST'
  path   : '/api/v1/tape/stop'

  config:

    description: "Stop recording"
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
        room_id  : joi.string().required()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      username = req.auth.credentials.user.username
      room_id  = req.payload.room_id

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

          update =
            $set:
              'status.is_recording'         : off
              'status.recording.stopped_at' : now().format()

          options = 
            fields:
              _id                           : off
              'status.recording.started_at' : on
              'status.recording.stopped_at' : on
              'status.is_recording'         : on

          request "#{s.tape}/stop/#{username}", ( error, response, body ) ->
            if error

              console.log "error starting tape"
              console.log error

              return      

            # JSON from tape server
            body = JSON.parse body

            Room.findAndModify query, null, update, options, ( error, response ) ->

              if error then return failed request, reply, error

              started_at = now( response.value.status.recording.started_at )
              stopped_at = now( update['status.recording.stopped_at'] )

              duration = stopped_at.diff( started_at, 'seconds' )
              
              update = 'status.recording.duration': duration

              Room.update _id: room._id, update, ( error, response ) ->

                if error
                  console.log 'error updating recording duration'
                  console.log 'error ->', error

              # recorded for this length
              console.log "Recorded #{duration} seconds"

              reply response