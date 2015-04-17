slug = require 'slug'
Room = schema 'room'

module.exports =
  method : 'POST'
  path   : '/api/v1/tape/start'

  config:

    description: "Start stream"
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
          'status.is_recording'         : true
          'status.recording.started_at' : now().format()


      # TODO: use Room.update instead of findAndModify
      options = 
        fields:
          _id  : off
        'new'  : true

      request "#{s.tape}/start/#{username}", ( error, response, body ) ->

        if error

          console.log "error starting tape"
          console.log error

          return      

        # JSON from tape server
        body = JSON.parse body

        update.$set[ 'recording.file' ] = body.file
        
        Room.findAndModify query, null, update, options, ( error, status ) ->

          if error then return failed req, reply, error

          reply status