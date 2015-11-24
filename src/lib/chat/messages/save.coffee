module.exports = ( room_id, data, callback ) ->

  # console.log '---'
  # console.log "saving message for #{room_id}"

  key  = "#{room_id}:messages"
  data = JSON.stringify data

  redis.lpush key, data, ( error, length ) ->

    if error then return callback error

    callback null, length