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
      .update( _id: room._id, update )
      .lean().exec ( error, response ) ->

        if error
          console.log 'error updated upload completed information '
          console.log "room_id : #{room_id}"
          console.log error

        reply ok: 1


    # console.log "+ completed upload : #{file}"
    # console.log "+ got S3 response:"
    # console.log response

    # # broadcast message regading end of upload
    # pusher.trigger "tape.#{mount_point}", "upload:finished", response.location

    # # adds s3 address to database
    # # set is_recorded to true
    # query  = _id: ObjectID room_id


    # db.rooms.update query, $set: update, ( error, response ) ->

    #   if error
    #     console.log "error saving"
    #     console.log error
    #   # else
    #     # console.log "success saving file to mongodb"