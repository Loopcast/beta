###

Compiles a stylus file and return a compiled css file

###

fs     = require 'fs'
path   = require 'path'

module.exports = 

  method: 'GET'
  path  : '/css/{file}'

  handler: ( request, reply ) ->

    url  = root + '/www/css/' + request.params.file

    console.log "url ->", url

    # try find on the file system first
    fs.readFile url, encoding: 'utf-8', ( error, content ) ->

      if error then return reply error

      reply( content ).type( 'text/css')