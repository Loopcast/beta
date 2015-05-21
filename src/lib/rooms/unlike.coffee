increase_like = lib 'rooms/increase_like'

module.exports = ( user_id, room_id, callback ) ->

  doc =
    user_id  : user_id
    type     : 'room'
    liked_id : room_id

  update: $set: end: now().toDate()

  Like.update( _id: room_id, update )
    .lean()
    .exec ( error, docs_updated ) ->

      if error then return callback error

      # +1 on the counter
      increase_like room_id, -1

      callback null, doc.toObject()