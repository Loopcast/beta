jade = require 'jade'
fs   = require 'fs'

module.exports = 

  method: 'GET'
  path  : '/{file}.css'

  handler: ( request, reply ) ->

    console.log 'you asked css ->', request.params.file

    reply 'Hello, we will render css ->', request.params.file