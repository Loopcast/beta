module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/listener_remove'

  config:

    description: "Callback by icecast server when a listener stop streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      ip   = req.payload.data.remoteAddress.split( ":" )[3]

      path = req.payload.data.path
      path = path.split( '/' )[2]

      path = path.split '_'

      username  = path[0]
      room_slug = path[1]

      console.log '- audiopump/listener_remove'

      console.log 'username : ', username
      console.log 'room_slug: ', room_slug
      console.log 'audiopump_id:', req.payload.data.id
      console.log 'ip  : ', ip

      reply ok: true

      if s.tape.ips.indexOf( ip ) isnt -1

        console.log "- ignored because comes from tape server"
        
        return

      query = 
        # 'status.audiopump_id' : req.payload.data.id
        'info.user': username
        'info.slug': room_slug

      Room.findOne( query )
        .select( "_id" )
        .sort( _id: - 1 )
        .lean()
        .exec ( error, room ) -> 

          if error
            console.log "error finding #{username}/#{room_slug} for listener_remove"
            console.log error

            return

          if not room
            # if audiopump id is old for instance
            console.log 'id ->', req.payload.data.id
            console.log "room not found #{username}/#{room_slug}"

            return

          console.log "listened removed for room_id #{room._id}"
      
          Room.update( _id: room._id, update: $inc: 'status.live.listeners': -1 )

          # count one less listener
          redis_key = "#{room._id}:listeners"
          redis.decr redis_key, ( error, value ) ->

            value = Number value.toString()

            # console.log "listened DECR for #{username}/#{room_slug} = #{value}"

            if value < 0
              redis.set redis_key, 0

              value = 0

            message = 
              type     : "listeners"
              listeners: Math.max( 0, value )

            sockets.send room._id, message