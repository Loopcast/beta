slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/stream_end'

  config:

    description: "Callback by icecast server when a broadcaster stops streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->


      console.log '- audiopump/stream_end'
            
      path = req.payload.data.path
      path = path.split( '/' )[2]

      path = path.split '_'

      username  = path[0]
      room_slug = path[1]

      end_time = req.payload.data.endTime


      console.log 'username  ->', username
      console.log 'room_slug ->', room_slug
      console.log 'end_time  ->', end_time

      query =
        'info.slug'  : room_slug
        'info.user'  : username

      Room.findOne( query )
        .select( "_id stream" )
        .populate( "stream" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          # status object to be sent down a socket Channel
          status =
            is_live: false
            live: 
              stopped_at: now( end_time ).format()

          sockets.send room._id, status

          update = $unset: streaming: ""      

          Room.update _id: room._id, update, ( error, response ) ->

            if error
              console.log 'error updating streaming duration'
              console.log 'error ->', error
          
          started_at = now( room.streaming.started_at )
          stopped_at = now( end_time )

          duration = stopped_at.diff( started_at, 'seconds' )

          # prepare data to update stream
          stream_update = 
            stopped_at: end_time
            duration  : duration

          # updating stream
          Stream
            .update( _id: room.stream, stream_update )
            .lean()
            .exec ( error, stream ) ->

              if error
                console.log "error updating stream:", stream
                console.log error

                return

              console.log 'updated stream ->', stream

              reply response: statusCode: 200