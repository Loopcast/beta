# save log of last 100 messages for a given room into redis
# automatically clean it after 7 days
LENGTH = s.cache.chat.messages.length
EXPIRE = s.cache.chat.messages.timeout

module.exports = ( room_id, data, callback ) ->

  console.log '---'
  console.log "saving message for #{room_id}"

  console.log 

  key  = "#{room_id}:messages"
  data = JSON.stringify data

  redis.lpush key, data, ( error, length ) ->

    if error then return callback error

    console.log '---'
    console.log 'redis lpush callback'
    console.log arguments

    if length > LENGTH

      redis.ltrim key, 0, LENGTH - 1, ( error, callback ) ->

        if error then return callback error
        
        console.log '---'
        console.log 'redis ltrim callback'
        console.log arguments

    callback null, length

  # expire key in 7 days
  redis.expire key, EXPIRE