module.exports =
  method: [ 'POST' ]
  path   : '/api/v1/tape/callbacks/error'

  config:

    validate:
      payload:
        room_id : joi.string().required()
        error   : joi.object().required()

  handler: ( req, reply )->

    console.log "error uploading file for #{room_id}"
    console.log error

    reply ok: 1