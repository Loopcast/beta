###

Compiles a coffee script file and return as js

###

fs     = require 'fs'
path   = require 'path'
coffee = require 'coffee-script'

module.exports = 

  method: 'GET'
  path  : '/js/{file}'

  handler: ( request, reply ) ->

    # check for real file
    url  = root + '/www/js/' + request.params.file

    console.log 

    fs.readFile url, encoding: 'utf-8', ( error, content ) ->

      if error then return reply error

      reply( content ).type( 'text/javascript')