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

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      username = req.auth.credentials.user.username
      room_id  = req.payload.room_id.toLowerCase()

      query =
        'info.user' : username
        'info.slug' : room_id

      update =
        $set : 
          'status.is_recording'         : off
          'status.recording.stopped_at' : now().format()

      options = 
        fields:
          _id                           : off
          'status.recording.started_at' : on
          'status.recording.stopped_at' : on
          'status.is_recording'         : on
        'new': true

      request "#{s.tape}/stop/#{username}", ( error, response, body ) ->
        if error

          console.log "error starting tape"
          console.log error

          return      

        # JSON from tape server
        body = JSON.parse body

        console.log "got response from tape stop", body 

        Room.findAndModify query, null, update, options, ( error, response ) ->

          if error then return failed request, reply, error

          started_at = now( response.value.status.recording.started_at )
          stopped_at = now( update.$set['status.recording.stopped_at'] )

          duration = stopped_at.diff( started_at, 'seconds' )
          
          # streamed for this length
          console.log "Recorded #{duration} seconds"

          reply response