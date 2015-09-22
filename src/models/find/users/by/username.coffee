module.exports = ( username, fields, callback ) ->

  User
    .findOne( 'info.username': username )
    .select( fields )
    .lean().exec callback
