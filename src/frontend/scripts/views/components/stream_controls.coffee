user = require 'app/controllers/user'

# TODO: animation for controls in and out

module.exports = ( dom ) ->

  # waits model get user name
  user.on 'user:logged', ( user ) ->

    console.log 'user logged ->', user.username

    if "/#{user.username}" is ways.pathname()
      $( '.controls' ).show()


  user.on 'user:unlogged', ->
    $( '.controls' ).hide()
