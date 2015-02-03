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

    root = path.join( __dirname + '/../../views/scripts/' )

    url  = root + request.params.file.replace '.js', '.coffee'

    
    fs.readFile url, encoding: 'utf-8', ( error, content ) ->

      if error then return reply( "coffee file not found" ).code 404

      try
        compiled = coffee.compile content, 
          bare    : 1
          filename: url

        reply compiled

      catch error

        reply error