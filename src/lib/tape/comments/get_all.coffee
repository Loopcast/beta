module.exports = ( tape_id, callback ) ->

  redis.lrange "#{tape_id}:comments", 0, -1, ( error, response ) ->

    if error then return callback error

    for item, index in response
      response[ index] = JSON.parse item

    callback null, response