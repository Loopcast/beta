slug = require 'slug'
Room = schema 'room'

mongoose = require 'mongoose'

module.exports =
  method : 'POST'
  path   : '/api/v1/stream/start'

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
        url : "#{username}/#{room_id}"

      update =
        $set : 
          'status.is_streaming': true
          'status.started_at'  : now()


      options = 
        fields:
          _id                  : off
          'status.is_streaming': on
        'new': true

      Room.findAndModify query, null, update, options, ( error, status ) ->

        if error then return failed request, reply, error

        reply status