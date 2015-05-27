module.exports = ( room_id, data, callback ) ->

  console.log '---'
  console.log "saving message for #{room_id}"

  console.log 

  key  = "#{room_id}:messages"
  data = JSON.stringify data

  redis.lpush key, data, ( error, callback ) ->

    console.log '---'
    console.log 'redis lpush callback'
    console.log arguments

  redis.trim key, 0, 99, ( error, callback ) ->

    console.log '---'
    console.log 'redis ltrim callback'
    console.log arguments

  callback null, data