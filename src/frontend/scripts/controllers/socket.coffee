L     = require 'api/loopcast/loopcast'

# socket-io client!!
connection = io()

socket = happens {}

connection.on "uid", ( socket_id ) ->

  socket.id = socket_id

  User = require './user'

  # set user socket_id when authenticating
  if User.is_logged()
    L.user.socket_id socket.id
  else
    User.on 'user:logged', ->
      L.user.socket_id socket.id

# mimics pusher API
socket.subscribe   = ( channel ) ->

  console.error "subscribing to:", channel
  
  connection.emit 'subscribe', channel

socket.unsubscribe = ( channel ) ->

  # temporarily remove all listeners, for the sake of simplicity
  connection.removeAllListeners channel
  connection.emit 'unsubscribe', channel

socket.rooms = {}

# mimics pusher API
socket.rooms.subscribe   = ( channel ) ->

  console.error "subscribing to:", channel
  
  connection.emit 'subscribe-room', channel

socket.rooms.unsubscribe = ( channel ) ->

  # temporarily remove all listeners, for the sake of simplicity
  connection.removeAllListeners channel
  connection.emit 'unsubscribe-room', channel


socket.off = ( channel, funk ) ->

  connection.removeListener channel, funk

module.exports = socket