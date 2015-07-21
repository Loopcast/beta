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

      mount_point = req.params.mount_point
      method_name = req.payload.method_name

      console.log "ip      : #{req.payload.ip}"
      console.log "payload : ", req.payload

      if s.tape.ips.indexOf( req.payload.ip ) isnt -1

        console.log "- ignored because comes from tape server"
        
        return reply( ok: true ).header( "icecast-auth-user", "1" )

      query = 
        $or      : [
          { 'user' : mount_point, 'status.is_live'      : true }
          { 'user' : mount_point, 'status.is_recording' : true }
        ]

      Room.findOne( query )
        .select( "_id" )
        .sort( _id: - 1 )
        .lean()
        .exec ( error, room ) -> 


          console.log "listened add for room_id #{room._id}"
      
          # count one more listener
          redis_key = "#{room._id}:listeners"
          redis.incr redis_key, ( error, value ) ->


            value = Number value.toString()

            console.log "updated redis with listener count: #{value}"

            message = 
              type     : "listeners"
              listeners: value

            sockets.send room._id, message

          # expires in 3 days, hopefully no streaming will last more than this
          expires = 60 * 24 * 3 
          redis.setex redis_key, expires, 1

          reply( ok: true ).header( "icecast-auth-user", "1" )