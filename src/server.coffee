Hapi = require 'hapi'

server = new Hapi.Server

server.connection port: s.port

server.start ->
  console.log 'Server running at:', server.info.uri

module.exports = server