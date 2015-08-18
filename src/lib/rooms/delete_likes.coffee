module.exports = ( room_id, callback ) ->

  query =
    type     : 'room'
    liked_id : room_id

  Like.remove query, callback