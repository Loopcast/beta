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

      mount_point = req.params.mount_point
      method_name = req.payload.method_name

      console.log "listener_remove : #{mount_point}, ip: #{req.payload.ip}"

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

          if error
            console.log "error finding room for listner_add"
            console.log error

            return reply( ok: true ).header( "icecast-auth-user", "1" )

          if not room
            console.log "room not found for user #{mount_point}"

            return reply( ok: true ).header( "icecast-auth-user", "1" )

          console.log "listened removed for room_id #{room._id}"
      
          # count one less listener
          redis_key = "#{room._id}:listeners"
          redis.decr redis_key, ( error, value ) ->


            value = Number value.toString()

            console.log "updated redis with listener count: #{value}"

            message = 
              type     : "listeners"
              listeners: value

            sockets.send room._id, message

          reply( ok: true ).header( "icecast-auth-user", "1" )