slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/callbacks/audiopump/mount_add'

  config:

    description: "Callback by icecast server when a broadcaster starts streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      console.log '- audiopump/mount_add'
      console.log req.payload
      console.log '- - -'

      reply( ok: true ).header( "icecast-auth-user", "1" )