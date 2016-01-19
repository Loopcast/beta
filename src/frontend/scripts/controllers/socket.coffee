L     = require 'api/loopcast/loopcast'


# socket-io client!!
connection = io()

socket = happens {}

connection.on "uid", ( socket_id ) ->

  socket.id = socket_id

  User = require './user'
  User.set_socket_id socket.id

  # set user socket_id when authenticating
  if User.is_logged()
    log "socket id of the logged user", socket_id
    L.user.socket_id socket.id, (error, response) ->
      # if there is an error on the socket id
      # of the logged user, it means the user is not valid,
      # then let's unlog him
      # if error
      #   User.logout null, true

  else
    User.on 'user:logged', ->
      L.user.socket_id socket.id

# mimics pusher API
socket.subscribe   = ( channel ) ->

  connection.emit 'subscribe', channel

socket.unsubscribe = ( channel ) ->

  # temporarily remove all listeners, for the sake of simplicity
  connection.removeAllListeners channel
  connection.emit 'unsubscribe', channel

socket.rooms = {}

# mimics pusher API
socket.rooms.subscribe   = ( channel , callback ) ->

  connection.emit 'subscribe-room', channel, callback

socket.rooms.unsubscribe = ( channel ) ->

  # temporarily remove all listeners, for the sake of simplicity
  connection.removeAllListeners channel
  connection.emit 'unsubscribe-room', channel

socket.on = ( channel, funk ) ->

  connection.on channel, funk

socket.off = ( channel, funk ) ->

  connection.removeListener channel, funk

module.exports = socket