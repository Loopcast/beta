# socket-io client!!
connection = io()

socket = happens {}


# mimics pusher API
socket.subscribe   = ( channel ) ->

  console.error "subscribing to:", channel
  
  connection.emit 'subscribe', channel

socket.unsubscribe = ( channel ) ->

  # temporarily remove all listeners, for the sake of simplicity
  connection.removeAllListeners channel
  connection.emit 'unsubscribe', channel

socket.on = ( channel, funk ) ->

  connection.on channel, funk

socket.off = ( channel, funk ) ->

  connection.removeListener channel, funk

module.exports = socket