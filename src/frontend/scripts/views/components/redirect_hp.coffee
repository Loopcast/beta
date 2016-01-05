navigation = require 'app/controllers/navigation'
user = require 'app/controllers/user'
module.exports = (dom) ->

  # Log out the user
  user.logout null, true

  # redirect to homepage
  navigation.go "/"