LENGTH = s.cache.chat.messages.length

module.exports = ( room_id, callback ) ->

  redis.lrange "#{room_id}:messages", -LENGTH, -1, ( error, response ) ->

    if error then return callback error

    for item, index in response
      response[ index] = JSON.parse item

    callback null, response