module.exports = ( ip, tape_id, callback ) ->

  redis_key = "#{ip}:played:tape:#{tape_id}"

  # only increase play if never played in the last 24 hours
  redis.get redis_key, ( error, buffer ) ->

    if buffer? then buffer = buffer.toString()

    # already played in the last 24 hours, just return ok
    if buffer then return callback null, 0

    # There is a 1 once 24 hours rate limit for playing a track
    # it's saved on redis
    expires = 60 * 24
    redis.setex redis_key, expires, 1

    # increase count on mongodb
    update = $inc: 'plays': 1

    Tape
      .update( _id: tape_id, update )
      .lean()
      .exec ( error, docs_updated ) ->

        if error then return callback? error

        callback null, docs_updated