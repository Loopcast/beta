# socket-io client!!
socket = io()


socket.onopen = () ->
  console.log 'socket open', socket

socket.onmessage = (e) ->
  console.log 'socket  message', e.data

socket.onclose = ->
  console.log 'socket close'


module.exports = socket