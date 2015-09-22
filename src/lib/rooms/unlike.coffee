increase = lib 'likes/increase'

module.exports = ( user_id, room_id, callback ) ->

  doc =
    user_id  : user_id
    type     : 'room'
    liked_id : room_id
    end      : $exists: false

  update = end: now().toDate()

  Like.update( doc, update )
    .lean()
    .exec ( error, docs ) ->

      if error then return callback error

      if docs.nModified > 0
        # +1 on the counter
        increase Room, room_id, -1

      callback null, 
        ok      : true
        modified: docs.nModified