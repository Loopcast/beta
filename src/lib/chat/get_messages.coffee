module.exports = ( room_id, callback ) ->

  redis.lrange "#{room_id}:messages", 0, 50, ( error, response ) ->

    if error then return callback error

    for item, index in response
      response[ index] = JSON.parse item

    callback null, response