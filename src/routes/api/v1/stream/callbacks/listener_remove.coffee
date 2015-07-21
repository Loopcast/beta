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
      console.log "ip      : #{req.payload.ip}"

      if s.tape.ips.indexOf( req.payload.ip ) is -1

        console.log "- ignored because comes from tape server"
        
        return reply( ok: true ).header( "icecast-auth-user", "1" )

      
      # count one less listener
      redis_key = "#{mount_point}:listeners"
      redis.decr redis_key, ( error, value ) ->


        value = Number value.toString()

        console.log "updated redis with listener count: #{value}"

        # message = 
          # type     : "listeners"
          # listeners: value

        # sockets.send mount_point, message

      console.log "payload"
      console.log req.payload

      reply( ok: true ).header( "icecast-auth-user", "1" )