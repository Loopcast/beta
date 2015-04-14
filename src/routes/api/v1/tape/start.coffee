slug = require 'slug'
Room = schema 'room'

mongoose = require 'mongoose'

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
          'status.is_recording'         : true
          'status.recording.started_at' : now().format()


      # TODO: use Room.update instead of findAndModify
      options = 
        fields:
          _id                  : off
        'new': true

      Room.findAndModify query, null, update, options, ( error, status ) ->

        if error then return failed request, reply, error

        reply status