slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/callbacks/{mount_point}/mount_remove'

  config:

    description: "Callback by icecast server when a source disconnects from the stream"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      mount_point = req.params.mount_point

      update = 
        'status.is_live'     : off
        'status.is_recording': off

      console.log "updating room -> #{mount_point}"
      
      Room.update _id: mount_point, update, ( error, response ) ->

        if error
          console.log 'error updating streaming duration'
          console.log 'error ->', error

        console.log "response ->", response

        console.log "Just lost connection from #{mount_point}"

      # debug
      # console.log "payload"
      # console.log req.payload
      
      reply( ok: true ).header( "icecast-auth-user", "1" )