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

      username = request.auth.credentials.user.username
      room_id  = request.payload.room_id.toLowerCase()

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
            'status.is_streaming'         : false
            'status.is_public'            : false
            'status.streaming.stopped_at' : now().format()

          options = 
            fields:
              _id                           : off
              'status.streaming.started_at' : on
              'status.streaming.stopped_at' : on
              'status.is_streaming'         : on

          Room.findAndModify query, null, update, options, ( error, response ) ->

            if error then return failed request, reply, error

            started_at = now( response.value.status.streaming.started_at )
            stopped_at = now( update['status.streaming.stopped_at'] )

            duration = stopped_at.diff( started_at, 'seconds' )
            
            # streamed for this length
            console.log "Streamed #{duration} seconds"

            reply response