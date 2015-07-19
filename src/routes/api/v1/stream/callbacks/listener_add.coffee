slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method : 'POST'
  path   : '/api/v1/stream/callbacks/{mount_point}/listener_add'

  config:

    description: "Callback by icecast server when a listener connects to the stream"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      method_name = request.params.method_name

      console.log "callback: #{method_name}"

      console.log "payload"
      console.log request.payload
      
      reply( ok: true ).header( "icecast-auth-user", "1" )