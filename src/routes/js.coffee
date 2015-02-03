jade = require 'jade'
fs   = require 'fs'

module.exports = 

  method: 'GET'
  path  : '/{file}.js'

  handler: ( request, reply ) ->

    console.log 'you asked js ->', request.params.file

    reply 'Hello, we will render js ->', request.params.file