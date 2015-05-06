User = schema 'user'

module.exports = ( query, fields, options, callback ) ->

  User.find( query, fields, options ).lean().exec ( error, users ) ->

    if error then return callback error

    callback null, users