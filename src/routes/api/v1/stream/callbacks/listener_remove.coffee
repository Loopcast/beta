slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/callbacks/{mount_point}/listener_remove'

  config:

    description: "Callback by icecast server when a listener disconnects from stream"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      method_name = req.params.method_name

      console.log "callback: #{method_name}"

      console.log "payload"
      console.log req.payload
      
      reply( ok: true ).header( "icecast-auth-user", "1" )