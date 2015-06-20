module.exports = ( ip, room_id, callback ) ->

  redis_key = "#{ip}:visited:room:#{room_id}"

  # only increase play if never played in the last 24 hours
  # increase_play room_id

  redis.get redis_key, ( error, buffer ) ->

    if buffer?
      buffer = buffer.toString()

    # already played in the last 24 hours, just return ok
    if buffer then return callback null, 0

    # There is a 1 once 24 hours rate limit for playing a track
    # it's saved on redis
    expires = 60 * 24
    redis.setex redis_key, expires, 1

    # increase count on mongodb
    update = $inc: 'status.recording.plays': 1

    Room
      .update( _id: room_id, update )
      .lean()
      .exec ( error, docs_updated ) ->

        if error then return callback? error

        callback null, docs_updated