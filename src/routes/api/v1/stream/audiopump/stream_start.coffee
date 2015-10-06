slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/stream_start'

  config:

    description: "Callback by icecast server when a broadcaster starts streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      console.log '- audiopump/stream_start'
            
      path = req.payload.data.path
      path = path.split( '/' )[2]

      path = path.split '_'

      username  = path[0]
      room_slug = path[1]

      start_time = req.payload.data.startTime

      query =
        'info.slug'  : room_slug
        'info.user'  : username

      Room.findOne( query )
        .select( "_id user stream" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          room_update =
            'status.is_live'         : true
            'status.live.started_at' : start_time

          stream = 
            user       : room.user
            room       : room._id
            started_at : start_time

          stream = new Stream doc

          stream.save ( error, doc ) ->

            if error 
              console.log "error creating stream document"
              console.log error
              
              return failed request, reply, error

              # notify UI the stream is live
              data =
                type   : "status"
                is_live: true
                live: 
                  started_at: now( start_time ).format()

              sockets.send room._id, data

            # save link to current recording on the room
            room_update.stream = doc._id

            Room.room_update( _id: room._id, room_update )
              .lean()
              .exec ( error, docs_updated ) ->

                if error

                  failed req, reply, error

                  return reply Boom.preconditionFailed( "Database error" )

                reply response: statusCode: 200