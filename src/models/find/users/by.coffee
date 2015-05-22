module.exports = ( query, callback ) ->

  User.findOne( query ).lean().exec callback
