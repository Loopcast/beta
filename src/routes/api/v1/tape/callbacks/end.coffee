module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/end'

  config:

    validate:
      payload:
        room_id : joi.string().required()

  handler: ( req, reply )->

    room_id = req.payload.room_id

    update = 'status.is_recording': off

    console.log '---'
    console.log 'tape callback end'
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


    # updates stopped_at in case it wasnt updated
    query =
      _id: room_id
      "status.recording.stopped_at" : $exists: false

    update = 'status.recording.stopped_at' : now().format()

    # in case room wasn't stopped before, add the stop
    Room
      .update( query, update )
      .lean().exec ( error, response ) ->

        if error
          console.log 'error updated upload completed information '
          console.log "room_id : #{room_id}"
          console.log error