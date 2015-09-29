mongoose = require 'mongoose'

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

            data = 
              type     : 'upload:finished'
              location : s3.location

            sockets.send room.user, data

            # pusher.trigger "tape.#{mount_point}", "upload:finished", response.location

            # query = _id: mongoose.Types.ObjectId room.recording
            # Tape.collection.update query, $set: s3: s3, null, ( error, response ) ->

            #     if error

            #       console.log 'error adding s3 information to Tape'
            #       console.log error

            #     console.log 'tape response ->', arguments

            # query = _id: mongoose.Types.ObjectId room_id
            # Room.collection.update query, $set: recording: null, null, ( error, response ) ->

            #     if error
            #       console.log 'error removing tape from room'
            #       console.log error

            #     console.log 'room response ->', arguments


            Tape.update _id: room.recording, $set: s3: s3, ( error, response ) ->

              if error

                console.log 'error adding s3 information to Tape'
                console.log error

              Room.update _id: room_id, $unset: recording: "", ( error, response ) ->

                  if error
                    console.log 'error removing tape from room'
                    console.log error