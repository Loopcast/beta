Room = schema 'room'

module.exports = ( query, field, callback ) ->

  # TODO: actually fetch profile genres instead of rooms
  Room.find( query ).distinct( field ).lean().exec ( error, genres ) ->

    if error then return callback error

    callback null, genres