user = require 'app/models/user'

module.exports = ( dom ) ->

  # waits model get user name
  user.on 'username', ( username ) ->

    if "/#{username}" is ways.pathname()
      $( '.controls' ).show()