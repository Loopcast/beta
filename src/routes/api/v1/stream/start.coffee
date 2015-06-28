slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

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
        .select( "_id _owner info.slug info.title info.genres info.about" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          # status object to be sent down a socket Channel
          data =
            type   : "status"
            is_live: true
            live: 
              started_at: now().format()

          sockets.send room_id, data

          # updates metadata in order to make it easier to see
          # on icecast sttus page
          metadata =
            title       : room.info.title
            description : room.info.about
            url         : "#{s.base_path}/#{username}/#{room.info.slug}"
            genres      : room.info.genres.join ','

          console.log "metadata ->", metadata

          update_metadata room._owner, metadata

          # update for mongodb
          # sets the document URL to be the streaming URL
          update =
            'info.url'      : "#{s.radio.url}/#{room._owner}"
            'status.is_live'         : true
            'status.live.started_at' : data.live.started_at

          Room.update( _id: room_id, update )
            .lean()
            .exec ( error, docs_updated ) ->

              if error

                failed req, reply, error

                return reply Boom.preconditionFailed( "Database error" )

              reply update