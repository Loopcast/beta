module.exports = ( room_id, user ) ->

  data = 
    type  : "listener:added"
    method: 'added'
    user : 
      id        : user._id
      socket_id : user.socket_id
      username  : user.info.username
      name      : user.info.name
      occupation: user.info.occupation
      avatar    : user.info.avatar
      followers : user.info.likes
      url       : "/" + user.info.username

  sockets.send room_id, data