slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/callbacks/audiopump/auth'

  config:

    description: "Callback by icecast server when a broadcasters connects to the server"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      user = req.payload.data.path
      pass = req.payload.data.requestHeaders.authorization.split( " " )[1]
      pass = new Buffer( pass, 'base64' ).toString( "ascii" )

      console.log '- audiopump/auth'

      console.log 'user: ', user
      console.log 'pass: ', pass

      console.log '- - -'
      

      reply( ok: true )