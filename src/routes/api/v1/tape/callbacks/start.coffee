module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/start'

  config:

    validate:
      payload:
        room_id : joi.string().required()

  handler: ( req, reply )->

    room_id = req.payload.room_id

    update = 'status.is_recording': on

    console.log '---'
    console.log 'tape callback start'
    console.log "room_id: #{room_id}"
    console.log '---'

    # notify UI the stream is live
    data =
      type        : "status"
      is_recording: true

    sockets.send room_id, data

    reply ok: 1