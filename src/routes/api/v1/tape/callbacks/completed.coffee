module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/completed'

  config:

    validate:
      payload:
        room_id : joi.string().required()
        s3      : joi.object().required()

  handler: ( req, reply )->

    room_id = req.payload.room_id
    s3      = req.payload.s3

    console.log "succesful upload for room_id: #{room_id}"
    console.log "s3 ->", s3

    update = 
      'info.file'          : s3.location
      'status.is_recorded' : on
      'status.recording.s3': s3

    Room
      .update( _id: room_id, update )
      .lean().exec ( error, response ) ->

        if error
          console.log 'error updated upload completed information '
          console.log "room_id : #{room_id}"
          console.log error

        reply ok: 1


        Room.findOne( _id: room_id )
          .select( "_id user recording" )
          .lean()
          .exec ( error, room ) -> 

            console.log 'updating tape for recording ->', room.recording

            data = 
              type     : 'upload:finished'
              location : s3.location

            sockets.send room.user, data

            # pusher.trigger "tape.#{mount_point}", "upload:finished", response.location

            mongoose.connection.collections['tapes'].update _id: room.recording, $set: s3: s3, ( error, response ) ->

                if error

                  console.log 'error adding s3 information to Tape'
                  console.log error

                console.log 'tape response ->', arguments

            update = recording: null

            mongoose.connection.collections['rooms'].update _id: room_id, $set: recording: null, ( error, response ) ->

                if error
                  console.log 'error removing tape from room'
                  console.log error

                console.log 'room response ->', arguments