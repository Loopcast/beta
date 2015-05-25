module.exports = ( room_id, amount, callback ) ->

  update = $inc: 'likes': amount

  Room.update( _id: room_id, update )
    .lean()
    .exec ( error, docs_updated ) ->

      console.log "response", arguments
      
      if error then return callback? error

      callback? error, docs_updated