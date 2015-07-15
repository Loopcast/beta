Room = schema 'room'

module.exports = ( query, fields, options, callback ) ->

  Room
    .find( query, fields, options )
    .populate( 'user', 'info.avatar info.username info.name' )
    .lean().exec ( error, rooms ) ->

      if error then return callback error

      callback null, rooms