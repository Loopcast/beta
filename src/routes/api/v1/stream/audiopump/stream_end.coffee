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

      reply()

      return

      mount_point = path

      console.log "-- CALLBACK MOUNT REMOVE"
      console.log "Just lost connection from #{mount_point}"
      console.log "---"

      query = 
        $or      : [
          { 'user' : mount_point, 'status.is_live'      : true }
          { 'user' : mount_point, 'status.is_recording' : true }
        ]

      Room.findOne( query )
        .select( "_id status" )
        .sort( _id: - 1 )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          # reply early to icecast if everything went allright!
          reply( ok: true ).header( "icecast-auth-user", "1" )


          # if room isn't live and isn't recording, then the user
          # succesfully pressed STOP STREAM and STOP RECORDING
          # before icecast received the disconnect event, so
          # everything should be fine.
          if not room.status.is_live and not room.status.is_recording

            return

          # If it still marked as live or recording, then we need
          # to update stopped_at information, and broadcast a socket
          # message so the frontend knows something went wrong.


          status =
            is_live: false

          update = {}


          if room.status.is_live

            # if room still live, then it was dropped
            update[ 'status.dropped' ] = true


            update['status.live.stopped_at'] = now().format()

            status.live = 
              stopped_at : update['status.live.stopped_at']

            started_at = now( room.status.live.started_at )
            stopped_at = now( update['status.live.stopped_at'] )

            duration = stopped_at.diff( started_at, 'seconds' )

            update['status.live.duration'] = duration

          if room.status.is_recording

            update['status.recording.stopped_at'] = now().format()

            status.recording = 
              stopped_at : update['status.recording.stopped_at']

            started_at = now( room.status.recording.started_at )
            stopped_at = now( update['status.recording.stopped_at'] )

            duration = stopped_at.diff( started_at, 'seconds' )

            update['status.recording.duration'] = duration

          update['status.is_live']      = false
          update['status.is_recording'] = false


          console.log "sending dropped message to frontend, room_id: #{room._id}"
          console.log "upating properties ->", update

          sockets.send room._id, status

          Room.update _id: room._id, update, ( error, response ) ->

            if error
              console.log 'error updating streaming duration'
              console.log 'error ->', error

            console.log "succesfully updated room information ->", response