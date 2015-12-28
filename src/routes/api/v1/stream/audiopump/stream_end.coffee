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

      path = req.payload.data.path
      path = path.split( '/' )[2]

      path = path.split '_'

      username  = path[0]
      room_slug = path[1]

      end_time = req.payload.data.endTime


      console.log '- audiopump/stream_end'

      console.log 'fullpath:', req.payload.data.path
      console.log 'audiopump_id:', req.payload.data.id
      console.log 'user: ', username
      console.log 'room: ', room_slug
      console.log 'time: ', end_time

      console.log '-- eo -- '

      query =
        'info.slug'  : room_slug
        'info.user'  : username

      Room.findOne( query )
        .select( "_id stream status.is_live status.is_recording" )
        .populate( "stream" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            console.log "failed to find #{room_slug} for #{username}"

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            console.log "failed to find #{room_slug} for #{username}"

            return reply Boom.resourceGone( "room not found or user not owner" )

          if not room.stream

            console.log '- error, room.stream not found for this user'
            console.log '- user not streaming'
            # reply response: statusCode: 200

            # return

          # if the user don't press live, we need to send a socket message
          # in order to get users offline in the room
          if room.status.is_live
            # notify UI the stream is live
            data =
              type   : "status"
              is_live: false
              live: 
                stopped_at: now( end_time ).format()

            sockets.send room._id, data

          if room.status.is_recording
            # notify UI the stream is live
            data =
              type        : "status"
              is_recording: false
              live: 
                stopped_at: now( end_time ).format()

            sockets.send room._id, data

          update = 
            $set   : 
              # reset will strem status
              will_stream           : false
              streaming             : null
              'status.is_live'      : false
              'status.is_recording' : false

          Room.update _id: room._id, update, ( error, response ) ->

            if error
              console.log 'error updating streaming duration'
              console.log 'error ->', error        
          
          started_at = now( room.stream.started_at )
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

              reply response: statusCode: 200