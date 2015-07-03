module.exports = ( room_id, socket_id ) ->
  data = 
    type  : "listener:removed"
    method: "removed"
    user  : socket_id : socket_id

  sockets.send room_id, data