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

        return reply Boom.unauthorized( 'needs authentication' )

      username = req.auth.credentials.user.username
      room_id  = req.payload.room_id

      query =
        _id: room_id
        'info.user' : username

      Room.findOne( query )
        .select( "_id _owner" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          # status object to be sent down a socket Channel
          status =
            is_live: true
            live: 
              started_at: now().format()

          room_channel = "#{username}.#{room_id}"
          response     = pusher.trigger room_channel, "status", status

          # update for mongodb
          # sets the document URL to be the streaming URL
          update =
            'info.url'      : "#{s.radio}/#{room._owner}"
            'status.is_live'         : true
            'status.live.started_at' : status.live.started_at

          Room.update( _id: room_id, update )
            .lean()
            .exec ( error, docs_updated ) ->

              if error

                failed req, reply, error

                return reply Boom.preconditionFailed( "Database error" )

              reply update