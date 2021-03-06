mongoose = require 'mongoose'

module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/completed'

  config:

    validate:
      payload:
        tape_id : joi.string().required()
        s3      : joi.object().required()

  handler: ( req, reply )->

    s3      = req.payload.s3
    tape_id = req.payload.tape_id

    reply ok: 1

    Tape
      .findOne( _id: tape_id )
      .select( "user" )
      .lean().exec ( error, tape ) ->


        if not tape

          return reply: error

        console.log '---'
        console.log 'tape callback completed'
        console.log "tape_id: #{tape_id}"
        console.log "user_id: #{tape.user}"

        data = 
          type : 'upload:finished'
          user : tape.user
          tape : tape_id

        sockets.send tape.user, data

        query = _id: mongoose.Types.ObjectId tape_id
        Tape.collection.update query, $set: s3: s3, null, ( error, response ) ->

            if error

              console.log 'error adding s3 information to Tape'
              console.log error

        # query = _id: mongoose.Types.ObjectId room_id
        # Room.collection.update query, $set: recording: null, null, ( error, response ) ->

        #     if error
        #       console.log 'error removing tape from room'
        #       console.log error


        # Tape.update _id: room.recording._id, $set: s3: s3, ( error, response ) ->

        #   if error

        #     console.log 'error adding s3 information to Tape'
        #     console.log error

        #   Room.update _id: room_id, $unset: recording: "", ( error, response ) ->

        #       if error
        #         console.log 'error removing tape from room'
        #         console.log error