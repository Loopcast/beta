module.exports = ( user_id, liked_id, type, callback ) ->

  query =
    user_id : user_id
    liked_id: liked_id
    end     : $exists: false

  if type? then query.type = type

  Like
    .find( query )
    .lean().exec ( error, response ) ->

      if error then return callback error

      callback null, response.length >= 1