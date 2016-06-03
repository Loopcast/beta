module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/listener_add'

  config:

    description: "Callback by icecast server when a listener starts streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      # console.log 'request ->', req.payload.data.requestHeaders

      ip   = req.payload.data.remoteAddress.split( ":" )[3]

      path = req.payload.data.path
      path = path.split( '/' )[2]

      path = path.split '_'

      username  = path[0]
      room_slug = path[1]

      console.log '- audiopump/listener_add'

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
            console.log "error finding #{username}/#{room_slug} for listner_add"
            console.log error

            return

          if not room
            # if audiopump id is old for instance
            # console.log "room not found #{username}/#{room_slug}"

            return

          # count one less listener
          redis_key = "#{room._id}:listeners"
          redis.incr redis_key, ( error, value ) ->

            value = Number value.toString()

            console.log "listened INCR for #{username}/#{room_slug} = #{value}"

            # reset in case went negative
            if value < 0
              redis.set redis_key, 1

              value = 1

            message = 
              type     : "listeners"
              listeners: Math.max( value, 0 )

            sockets.send room._id, message