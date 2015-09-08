module.exports = ( room_id, user, is_guest ) ->

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
      followers : user.likes
      url       : "/" + user.info.username

  if is_guest
    delete data.user.url

  sockets.send room_id, data