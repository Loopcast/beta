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

radio  = 'http://radio.loopcast.fm:8000'
server = http.createServer (req, res) ->

  mount_point = url.parse(req.url).pathname

  res.writeHead 302, Location: "#{radio}#{mount_point}"
  res.end();

server.listen 8080