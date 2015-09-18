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
    s3      = req.payload.room_id

    console.log "succesful upload for room_id: #{room_id}"
    console.log "s3 ->", s3

    reply ok: 1