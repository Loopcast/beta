# TODO: implement socket authentication
# https://github.com/hapijs/discuss/issues/48

# reference to socket.io
io = null

redis_client = null

sockets = { stats: null, online: false }
stats   = {}

sockets.stats = stats

socket_left_room = lib 'sockets/room/left'

#
# ~ server basics
#

# use redis as backend in order to keep messages going through
# multiple socket instances
sockets.connect = ( listener ) ->

  io = sockets.io = require('socket.io')(listener)

  try
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

  catch e
    console.log 'error connecting to redis?'
    console.log e

  sockets.online = true
  sockets.boot io


sockets.boot = ( server ) ->

  server.on 'connection', ( socket ) ->

    socket.emit "uid", socket.id

    stats[ socket.id ] =
      connected: true
      rooms    : {}

    socket.on 'disconnect', ->

      stats[ socket.id ].connected = false

      rooms = Object.keys stats[socket.id].rooms

      # user has joined a room!
      if rooms.length

        for room_id in rooms

          socket_left_room( room_id, socket.id )

        # remove socket_id from all rooms it has joined @ mongodb
        query   =  _id : $in    : rooms
        update  = $pull: in_chat: socket.id
        options = multi: true

        Room.update query, update, options, ( error, r ) ->

          if error
            console.log "error removing socket #{socket.id} from all rooms"
            console.log error

          else
            # cleanup stats just to make sure we don't have ghosts
            delete stats[ socket.id ]

    # sub / unsub jazz
    socket.on 'subscribe'  , ( room ) ->

      socket.join  room

    socket.on 'unsubscribe', ( room ) ->
      socket.leave room

    # add / remove user from room when subscribing
    socket.on 'subscribe-room', ( room, callback ) ->
      socket.join  room

      stats[socket.id].rooms[room] = true

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
      stats[socket.id].rooms[room] = false

      socket_left_room( room, socket.id )

      # remove socket_id from the unsubscribed room
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

  # assumes no one will try to connect to this socket again
  sockets.online = false

  clients = Object.keys( stats )

  if not clients.length then return callback()

  redis_client.end?()

  query   = in_chat  : $in    : clients
  update  = $pullAll : in_chat: clients
  options = multi    : true

  Room.update query, update, options, ( error ) ->
    if error
      console.log "error removing users from room when server shutdown"
      console.log error


    callback()


#
# ~ messaging
#

sockets.send = ( channel, data ) ->

  # console.log "sending ", data
  # console.log "to ", channel

  io.sockets.in( channel ).emit( channel, data );

module.exports = sockets
