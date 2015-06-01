# defaults to production environment
if not process.env.NODE_ENV then process.env.NODE_ENV = 'local'

http  = require 'http'
https = require 'https'
http.globalAgent.maxSockets = https.globalAgent.maxSockets = 100;

console.log "+ ENV"
console.log "-   NODE_ENV = " + process.env.NODE_ENV
console.log ""

# require newrelic when running on "beta" or "development" environment
# local machines ( developers testing ) should not be running newrelic
if process.env.NODE_ENV is 'development' or process.env.NODE_ENV is 'beta'
  console.log '+ Requesting new relic'
  newrelic = require 'newrelic'

g = require './globals'

# save server as global variable as well
g.server = require './server'

mongoose = require 'mongoose'

server.start ( error ) ->

  mongoose.connect s.mongo.url, ( error ) ->

    if error
      
      console.error error
      server.stop()

      return


    console.log '+ connected to mongodb'


    # TODO: Allow extra fields on methods, so we can have semi-free schema API
    glob = require 'glob'
    glob __dirname + "/routes/**/*.coffee", ( error, files ) ->

      for file in files

        server.hapi.route require( file )