increase_play = lib 'rooms/increase_play'

module.exports =
  method : 'PUT'
  path   : '/api/v1/rooms/{id}/play'

  config:
    description: "Count a play for a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      ip = req.headers['x-forwarded-for'] || req.info.remoteAddress

      room_id = req.params.id

      console.log 'increase play for !', room_id
      console.log 'comming from ip:', ip

      redis_key = "#{ip}:played:#{room_id}"

      increase_play room_id
      
      redis.get redis_key, ( error, buffer ) ->

        if buffer?
          buffer = buffer.toString()

        # already played in the last 24 hours, just return ok
        if buffer then return reply: ok: 1

        # There is a 1 once 24 hours rate limit for playing a track
        # it's saved on redis
        expires = 60 * 24
        redis.setex redis_key, expires, 1

        # increase count on mongodb
        increase_play room_id

        reply ok: 1