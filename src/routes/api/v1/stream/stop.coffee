slug = require 'slug'
Room = schema 'room'

mongoose = require 'mongoose'

module.exports =
  method : 'POST'
  path   : '/api/v1/stream/stop'

  config:

    description: "Stop stream"
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

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id = request.auth.credentials.user._id
      room_id = request.payload.room_id.toLowerCase()

      query =
        _id  : room_id
        user : user_id

      Room.findOne( query )
        .select( "_id stream" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          reply ok: 1

          # status object to be sent down a socket Channel
          status =
            type   : "status"
            is_live: false
            live: 
              stopped_at: now().format()

          sockets.send room_id, status

          update =
            $set:
              will_stream              : false
              'status.is_live'         : false
              # 'status.is_public'       : false
              'status.live.stopped_at' : now().format()
            $unset: 
              streaming: ""

          options = 
            fields:
              _id                      : off
              'status.live.started_at' : on
              'status.live.stopped_at' : on
              'status.is_live'         : on

          Room.findAndModify query, null, update, options, ( error, response ) ->

            if error then return failed request, reply, error

            started_at = now( response.value.status.live.started_at )
            stopped_at = now( update.$set['status.live.stopped_at'] )

            duration = stopped_at.diff( started_at, 'seconds' )

            # prepare data to update stream
            stream_update = 
              stopped_at: update.$set['status.live.stopped_at']
              duration  : duration

            update = 'status.live.duration': duration

            Room.update _id: room._id, update, ( error, response ) ->

              if error
                console.log 'error updating streaming duration'
                console.log 'error ->', error
            
            # streamed for this length
            console.log "Streamed #{duration} seconds"


            # updating stream
            Stream
              .update( _id: room.stream, stream_update )
              .lean()
              .exec ( error, stream ) ->

                if error
                  console.log "error updating stream:", stream
                  console.log error

                  return