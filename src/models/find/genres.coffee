Room = schema 'room'

module.exports = ( query, field, callback ) ->

  Room.find( query ).distinct( field ).lean().exec ( error, genres ) ->

    if error then return callback error

    callback null, genres