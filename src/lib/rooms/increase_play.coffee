module.exports = ( room_id, callback ) ->

  update = $inc: 'status.recording.plays': 1

  console.log 'incremeting play ', update

  Room.update( _id: room_id, update )
    .lean()
    .exec ( error, docs_updated ) ->

      if error then return callback? error

      callback? error, docs_updated