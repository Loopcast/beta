module.exports = ( tape_id, data, callback ) ->

  key  = "#{tape_id}:comments"
  data = JSON.stringify data

  redis.lpush key, data, ( error, length ) ->

    if error then return callback error

    callback null, length