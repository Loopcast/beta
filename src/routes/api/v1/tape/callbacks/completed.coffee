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

    # pusher.trigger "tape.#{mount_point}", "upload:finished", response.location
    Room.findOne( _id: room_id )
      .select( "_id recording" )
      .lean()
      .exec ( error, room ) -> 

        console.log 'updating tape for recording ->', room.recording

        Tape
          .update( _id: room.recording, s3: s3 )
          .lean().exec ( error, response ) ->

            if error

              console.log 'error adding s3 information to Tape'
              console.log error


        Room
          .update( _id: room_id, recording: null )
          .lean().exec ( error, response ) ->

            if error
              console.log 'error removing tape from room'
              console.log error