module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/end'

  config:

    validate:
      payload:
        tape_id  : joi.string().required()
        duration : joi.number().required()

  handler: ( req, reply )->

    tape_id  = req.payload.tape_id
    duration = req.payload.duration
    
    update = 'status.is_recording': off

    console.log '---'
    console.log 'tape callback end'
    console.log "tape_id : #{tape_id}"
    console.log "duration: #{duration}"
    console.log '---'

    query =
      _id        : room_id
      stopped_at : $exists: false

    update = 
      $set:
        duration   : duration
        stopped_at : now().format()

    Tape
      .update( query, update )
      .lean().exec ( error, result ) ->

        if error
          console.log 'error updated upload completed information '
          console.log "room_id : #{room_id}"
          console.log error


    # Tape
    #   .findOne( _id: tape_id )
    #   .selecT( "room" )
    #   .lean().exec ( error, tape ) ->

    #     room_id = tape.room

    #     Room
    #       .update( _id: room_id, update )
    #       .lean().exec ( error, response ) ->

    #         if error
    #           console.log 'error updated upload completed information '
    #           console.log "room_id : #{room_id}"
    #           console.log error

    #         reply ok: 1


    #     # updates stopped_at in case it wasnt updated
    #     query =
    #       _id: room_id
    #       "status.recording.stopped_at" : $exists: false

    #     update = 'status.recording.stopped_at' : now().format()

    #     # in case room wasn't stopped before, add the stop
    #     Room
    #       .update( query, update )
    #       .lean().exec ( error, response ) ->

    #         if error
    #           console.log 'error updated upload completed information '
    #           console.log "room_id : #{room_id}"
    #           console.log error