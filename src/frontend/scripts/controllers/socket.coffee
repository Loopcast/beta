# socket-io client!!
connection = io()

socket = happens {}


# mimics pusher API
socket.subscribe   = ( channel ) ->

  connection.emit 'subscribe', channel

socket.unsubscribe = ( channel ) ->

  connection.emit 'unsubscribe', channel


connection.on 'uid', ( data ) ->

  console.log "got uid ->", data

connection.onopen = () ->
  console.log 'socket open', socket

socket.onmessage = (e) ->
  console.log 'socket  message', e.data

socket.onclose = ->
  console.log 'socket close'


module.exports = socket