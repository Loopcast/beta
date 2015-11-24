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
      'status.is_recorded' : false
      'status.recording.s3': s3

    console.log '---'
    console.log 'tape callback completed'
    console.log "room_id: #{room_id}"
    console.log '---'

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
          .populate( "user", "_id info.username" )
          .populate( "recording", "_id slug" )
          .lean()
          .exec ( error, room ) -> 

            console.log 'room ->', room
            console.log 'user ->', room.user
            console.log 'recording ->', room.recording

            data = 
              type : 'upload:finished'
              room : room

            sockets.send room.user._id, data

            query = _id: mongoose.Types.ObjectId room.recording._id
            Tape.collection.update query, $set: s3: s3, null, ( error, response ) ->

                if error

                  console.log 'error adding s3 information to Tape'
                  console.log error

            query = _id: mongoose.Types.ObjectId room_id
            Room.collection.update query, $set: recording: null, null, ( error, response ) ->

                if error
                  console.log 'error removing tape from room'
                  console.log error


            # Tape.update _id: room.recording._id, $set: s3: s3, ( error, response ) ->

            #   if error

            #     console.log 'error adding s3 information to Tape'
            #     console.log error

            #   Room.update _id: room_id, $unset: recording: "", ( error, response ) ->

            #       if error
            #         console.log 'error removing tape from room'
            #         console.log error