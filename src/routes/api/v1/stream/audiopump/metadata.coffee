slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'PUT' ]
  path   : '/api/v1/stream/callbacks/audiopump/metadata'

  config:

    description: "Callback by icecast server when a metadata changes"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      console.log '- audiopump/metadata'
      console.log req.payload
      console.log '- - -'

      reply( ok: true ).header( "icecast-auth-user", "1" )