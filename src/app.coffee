# defaults to production environment
if not process.env.NODE_ENV then process.env.NODE_ENV = 'local'

g = require './globals'


mongoose = require 'mongoose'

http  = require 'http'
https = require 'https'
http.globalAgent.maxSockets = https.globalAgent.maxSockets = 100;

console.log "+ ENV"
console.log "-   NODE_ENV = " + process.env.NODE_ENV
console.log ""

# require newrelic when running on "beta" or "development" environment
# local machines ( developers testing ) should not be running newrelic
if process.env.NODE_ENV isnt 'local'
  console.log '+ Requesting new relic'
  newrelic = require 'newrelic'


server.start ( error ) ->

  mongoose.connect s.mongo.url, ( error ) ->

    if error
      
      console.error error

      server.hapi.stop()

      return


    console.log '+ connected to mongodb'


    # TODO: Allow extra fields on methods, so we can have semi-free schema API
    glob = require 'glob'
    glob __dirname + "/routes/**/*.coffee", ( error, files ) ->

      for file in files

        server.hapi.route require( file )

      process.nextTick -> 
        # open socket server after routing all routes
        sockets.connect server.hapi.listener


# gracefully shutdown with nodemon
process.once 'SIGUSR2', ->

  console.log "SIGUSR2 - SIGNAL"
  
  # stop the https server
  server.hapi.stop { timeout: 5 * 1000}, ->
    # shutdown sockets gracefully
    sockets.shutdown -> 
      # kill the process!
      process.kill process.pid, 'SIGUSR2'


# gracefully shutdown with SIGTERM
process.once 'SIGTERM', ->

  console.log "SIGTERM - SIGNAL"

  # stop the https server
  server.hapi.stop { timeout: 5 * 1000}, ->
    # shutdown sockets gracefully
    sockets.shutdown -> 
      # kill the process!
      process.exit 0