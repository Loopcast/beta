Hapi = require 'hapi'

server = new Hapi.Server
  debug: request: ['error']

module.exports = server