# update to socket.io client
# https://github.com/automattic/socket.io-redis

sockets = { stats: null }
stats   = {}

sockets.stats = stats

sockets.connect = ( listener ) ->

  io    = require('socket.io')(listener)
  # redis = require('socket.io-redis')

  redis_client = require('redis').createClient
  adapter      = require('socket.io-redis')

  pub = redis_client( s.heroku_redis.port, s.heroku_redis.host )
  pub.auth( s.heroku_redis.password )

  sub = redis_client( s.heroku_redis.port, s.heroku_redis.host )
  sub.auth( s.heroku_redis.password )

  io.adapter adapter(
    pubClient: pub
    subClient: sub
  )

  sockets.boot io


sockets.boot = ( server ) ->

  server.on 'connection', ( socket ) ->

    console.log "socket connected ->", socket.id

    stats[ socket.id ] = connected: true

    # sockets.send socket, 'uid', uid: socket.id

    # socket.on 'data', ( data ) ->

    #   console.log "got data from socket ->", data

    # socket.on 'close', ->

    #   stats[ socket.id ] = connected: false

    #   console.log "socket is gone!"

# sockets.send = ( socket, channel, data ) ->

#   data = data || {}
#   data.channel = channel

#   socket.write JSON.stringify data

module.exports = sockets