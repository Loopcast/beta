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
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        room_id  : joi.string().required()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      username = request.auth.credentials.user.username
      room_id  = request.payload.room_id.toLowerCase()

      query =
        'info.user' : username
        'info.slug' : room_id

      update =
        $set : 
          'status.is_recording'         : false
          'status.recording.stopped_at' : now().format()

      options = 
        fields:
          _id                  : off
          'status.recording.started_at'  : on
          'status.recording.stopped_at'  : on
        'new': true

      Room.findAndModify query, null, update, options, ( error, response ) ->

        if error then return failed request, reply, error

        started_at = now( response.status.streaming.started_at )
        stopped_at = now( update.$set['status.streaming.stopped_at'] )

        stop_duration = stopped_at.diff( started_at, 'seconds' )
        
        # recorded for this length
        console.log "length ->", stop_duration

        reply response