###
#
# Controller responsible for communication with other instances of the app
# for instance another tab or pop up open
#
# see https://github.com/jeremyharris/LocalConnection.js/tree/master
# fore more information, for instance integration with IE9
#
###

app = require 'app/app'

connection = new LocalConnection 'beta.loopcast.fm'
connection.listen()

connection.addCallback 'login', ( user ) ->

  console.info ' + location connection, user logged in:', user

  app.login user

connection.addCallback 'logout', ->

  console.info ' + location connection, user logged out'

  app.logout()

module.exports = connection