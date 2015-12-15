uuid            = require 'node-uuid'

module.exports =
  method : 'POST'
  path   : '/api/v1/stream/start'

  config:

    description: "Returns a new password to connect the stream to this room"
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
      user_id  = req.auth.credentials.user._id
      room_id  = req.payload.room_id

      query =
        _id  : room_id
        user : user_id

      Room.findOne( query )
        .select( "_id user info.slug info.title info.genres info.about status.is_recording" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )


          update = 
            will_stream : true

          if room.status.is_recording

            update[ 'status.is_live' ] = true

          else

            update.password          = uuid.v4() 
            update['info.url']       = "#{s.radio.url}#{username}_#{room.info.slug}"
            update['status.is_live'] = true
          
          Room.update( _id: room_id, update )
            .lean()
            .exec ( error, docs_updated ) ->

              if error

                failed req, reply, error

                return reply Boom.preconditionFailed( "Database error" )

              reply update