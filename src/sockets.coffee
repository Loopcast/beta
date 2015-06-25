# TODO: implement socket authentication
# https://github.com/hapijs/discuss/issues/48

# reference to socket.io
io = null

sockets = { stats: null, online: false }
stats   = {}

sockets.stats = stats

#
# ~ server basics
#

# use redis as backend in order to keep messages going through
# multiple socket instances
sockets.connect = ( listener ) ->

  io = require('socket.io')(listener)

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

  sockets.online = true
  sockets.boot io


sockets.boot = ( server ) ->

  server.on 'connection', ( socket ) ->

    console.log "socket connected ->", socket.id

    socket.emit "uid", socket.id

    stats[ socket.id ] = connected: true

    socket.on 'disconnect', ->

      stats[ socket.id ] = connected: false

      console.log "socket is gone!", socket.id


    # sub / unsub jazz
    socket.on 'subscribe'  , ( room ) -> socket.join  room
    socket.on 'unsubscribe', ( room ) -> socket.leave room

sockets.shutdown = ( callback ) -> 

  return callback() if not sockets.online

  for id, socket of sockets.stats

    if socket.connected
      console.log "socket #{id} has to be disconnected"

    socket.connected = false 

  callback()


#
# ~ messaging
#

sockets.send = ( channel, data ) ->

  console.log "sending ", data
  console.log "to ", channel

  io.sockets.in( channel ).emit( channel, data );

module.exports = sockets