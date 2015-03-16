###
# This is a simple HTTP redirect test
# This way we can point the audio tag to a node.js endpoint
# and dinamically point the user to a new server without
# the need of a DNS TTL
###

http = require 'http'
fs   = require 'fs'
util = require 'util'
url  = require 'url'

server = http.createServer (req, res) ->

  console.log 'requested ->', url.parse(req.url).pathname

  res.writeHead 302, Location: 'http://radio.loopcast.fm:8000/hems'
  res.end();

server.listen 8080