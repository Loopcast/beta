module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/start'

  config:

    validate:
      payload:
        tape_id : joi.string().required()

  handler: ( req, reply )->

    tape_id = req.payload.tape_id

    Tape.findOne( _id: tape_id )
      .select( "room" )
      .lean().exec ( error, tape ) -> 

        update = 'status.is_recording': on

        console.log '---'
        console.log 'tape callback start'
        console.log "tape_id: #{tape_id}"
        console.log "room_id: #{tape.room}"
        console.log '---'

        # notify UI the stream is live
        data =
          type        : "status"
          is_recording: true

        sockets.send tape.room, data

        reply ok: 1