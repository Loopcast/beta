# defaults to production environment
if not process.env.NODE_ENV then process.env.NODE_ENV = 'local'

# require newrelic when running on "beta" or "development" environment
# local machines ( developers testing ) should not be running newrelic
if process.env.NODE_ENV is 'development' or process.env.NODE_ENV is 'beta'
  console.log '+ Requesting new relic'
  newrelic = require 'newrelic'

g = require './globals'

# save server as global variable as well
g.server = require './server'

server.start ( error ) ->

  glob = require 'glob'
  glob __dirname + "/routes/**/*.coffee", ( error, files ) ->

    for file in files

      server.hapi.route require( file )