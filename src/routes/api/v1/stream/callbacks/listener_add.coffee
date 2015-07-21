slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/callbacks/{mount_point}/listener_add'

  config:

    description: "Callback by icecast server when a listener connects to the stream"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      method_name = req.params.method_name

      console.log "callback: #{method_name}"

      if s.tape.ips.indexOf( req.payload.ip ) is -1

        console.log "- ignored because comes from tape server"
        
        return reply( ok: true ).header( "icecast-auth-user", "1" )

      
      # count one more listener
      redis_key = "#{mount_point}:listeners"
      redis.incr redis_key, ( error, value ) ->


        value = Number value.toString()

        console.log "updated redis with listener count: #{value}"

        # message = 
          # type     : "listeners"
          # listeners: value

        # sockets.send mount_point, message

      # expires in 3 days, hopefully no streaming will last more than this
      expires = 60 * 24 * 3 
      redis.setex redis_key, expires, 1

      console.log "payload"
      console.log req.payload

      reply( ok: true ).header( "icecast-auth-user", "1" )