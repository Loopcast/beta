module.exports = ( query, fields, options, callback ) ->

  Tape
    .find( query, fields, options )
    .populate( "user", "info.name info.username info.avatar info.occupation likes" )
    .select( fields )
    .lean().exec ( error, users ) ->

      if error then return callback error

      callback null, users