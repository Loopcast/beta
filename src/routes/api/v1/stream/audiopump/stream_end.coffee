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

            console.log "failed to find #{room_slug} for #{username}"

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            console.log "failed to find #{room_slug} for #{username}"

            return reply Boom.resourceGone( "room not found or user not owner" )

          if not room.stream

            console.log '- user not streaming'
            reply response: statusCode: 200

            return

          # status object to be sent down a socket Channel
          status =
            is_live: false
            live: 
              stopped_at: now( end_time ).format()

          sockets.send room._id, status

          update = 
            $set   : 
              streaming: null
              is_live  : false


          console.log "updating room #{room._id}"
          console.log "with info ->", update
          
          query = _id: mongoose.Types.ObjectId room._id
          Room.collection.update query, update, null, ( error, response ) ->

            if error
              console.log 'error removing tape from room'
              console.log error

            console.log "updated room ->", response

          # Room.update _id: room._id, update, ( error, response ) ->

          #   if error
          #     console.log 'error updating streaming duration'
          #     console.log 'error ->', error

          #   console.log "updated room ->", response

            
          
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

              console.log 'updated stream ->', stream

              reply response: statusCode: 200