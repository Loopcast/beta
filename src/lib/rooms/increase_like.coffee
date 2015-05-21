module.exports = ( room_id, amount, callback ) ->

  update = $inc: 'likes': amount

  console.log "increasing like for room_id #{room_id}"
  console.log "update ->", update

  Room.update( _id: room_id, update )
    .lean()
    .exec ( error, docs_updated ) ->

      console.log "response", arguments
      
      if error then return callback? error

      callback? error, docs_updated