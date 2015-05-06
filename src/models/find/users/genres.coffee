User = schema 'user'

module.exports = ( query, field, callback ) ->

  User.find( query ).distinct( field ).lean().exec ( error, genres ) ->

    if error then return callback error

    callback null, genres