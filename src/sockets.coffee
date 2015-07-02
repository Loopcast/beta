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

  io = sockets.io = require('socket.io')(listener)

  redis_client = require('redis').createClient
  adapter      = require('socket.io-redis')

  pub = redis_client s.heroku_redis.port, s.heroku_redis.host,
    auth_pass: s.heroku_redis.password

  sub = redis_client s.heroku_redis.port, s.heroku_redis.host,
    auth_pass     : s.heroku_redis.password
    detect_buffers: true

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

      # console.log "socket is gone!", socket.id

      # remove socket_id from all rooms it has joined
      query   = in_chat: socket.id
      update  = $pull: in_chat: socket.id
      options = multi: true
      Room.update query, update, options, ( error ) ->

        if error
          console.log "error removing socket #{socket.id} from all rooms"
          console.log error

        # console.log "#{socket.id} removed from all rooms!"


    # sub / unsub jazz
    socket.on 'subscribe'  , ( room ) -> 
      socket.join  room

    socket.on 'unsubscribe', ( room ) -> 
      socket.leave room

    # add / remove user from room when subscribing
    socket.on 'subscribe-room', ( room, callback ) -> 
      socket.join  room

      # add socket_id to room
      query   = _id: room
      update  = $push: in_chat: socket.id
      options = multi: true
      Room.update query, update, options, ( error ) ->

        if error
          console.log "error adding socket #{socket.id} to room #{room}"
          console.log error

        # console.log "#{socket.id} added to room #{room}"

        if callback 
          socket.emit "#{room}-done", 'done!'
          
          # console.log "emited done for " + "#{room}-done"

          callback()

      
    socket.on 'unsubscribe-room', ( room ) -> 
      socket.leave room

      # remove socket_id from room
      query   = _id: room
      update  = $pull: in_chat: socket.id
      options = multi: true
      Room.update query, update, options, ( error ) ->

        if error
          console.log "error removing socket #{socket.id} to room #{room}"
          console.log error

        # console.log "#{socket.id} removed from room #{room}"
      

sockets.shutdown = ( callback ) -> 

  return callback() if not sockets.online

  clients = Object.keys( stats )

  if not clients.length then return callback()


  query   = in_chat  : $in    : clients
  update  = $pullAll : in_chat: clients
  options = multi    : true
  
  Room.update query, update, options, ( error ) ->
    if error
      console.log "error removing users from room when server shutdown"
      console.log error
    else
      console.log "success removing socket from rooms!"

    callback()


#
# ~ messaging
#

sockets.send = ( channel, data ) ->

  # console.log "sending ", data
  # console.log "to ", channel

  io.sockets.in( channel ).emit( channel, data );

module.exports = sockets