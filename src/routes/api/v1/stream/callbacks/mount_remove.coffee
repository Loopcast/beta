slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/callbacks/{mount_point}/mount_remove'

  config:

    description: "Called by icecast server when a source disconnects from the streaming server"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      mount_point = req.params.mount_point

      console.log "Just lost connection from #{mount_point}"

      query = 
        $or      : [
          { 'user' : mount_point, 'status.is_live'      : true }
          { 'user' : mount_point, 'status.is_recording' : true }
        ]

      Room.findOne( query )
        .select( "_id status" )
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
            dropped: true
            live: 
              stopped_at: now().format()

          update = {}

          update[ 'status.dropped' ] = true

          if room.status.is_live

            update['status.live.stopped_at'] = now().format()

            started_at = now( room.status.live.started_at )
            stopped_at = now( update['status.live.stopped_at'] )

            duration = stopped_at.diff( started_at, 'seconds' )

            update['status.live.duration'] = duration

          if room.status.is_recording

            update['status.recording.stopped_at'] = now().format()

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