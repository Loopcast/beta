g = require './globals'

# save server as global variable as well
g.server = require './server'

glob = require 'glob'
glob __dirname + "/routes/**/*.coffee", ( error, files ) ->

  for file in files

    server.route require( file )