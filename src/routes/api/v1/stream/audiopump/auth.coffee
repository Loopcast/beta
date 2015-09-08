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

      console.log '- audiopump/auth'
      console.log req.payload
      console.log '- - -'

      reply( ok: true ).header( "icecast-auth-user", "1" )