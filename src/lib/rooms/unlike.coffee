increase_like = lib 'rooms/increase_like'

module.exports = ( user_id, room_id, callback ) ->

  doc =
    user_id  : user_id
    type     : 'room'
    liked_id : room_id
    end      : $exists: false

  update = end: now().toDate()

  Like.update( doc, update )
    .lean()
    .exec ( error, docs_updated ) ->

      if error then return callback error

      # +1 on the counter
      increase_like room_id, -1

      callback null, ok: docs_updated