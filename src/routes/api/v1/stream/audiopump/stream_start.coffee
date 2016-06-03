slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

notify_user_is_live  = lib 'renotifier/user_is_live'

module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/stream_start'

  config:

    description: "Callback by icecast server when a broadcaster starts streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      path = req.payload.data.path
      path = path.split( '/' )[2]

      path = path.split '_'

      username  = path[0]
      room_slug = path[1]


      console.log '- audiopump/stream_start'

      console.log 'fullpath:'    , req.payload.data.path
      console.log 'audiopump_id:', req.payload.data.id
      console.log 'user: ', username
      console.log 'room: ', room_slug

      start_time = req.payload.data.startTime

      query =
        'info.slug'  : room_slug
        'info.user'  : username

      Room.findOne( query )
        .select( "_id user stream will_stream info.slug notify" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            console.log "failed to find #{room_slug} for #{username}"

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            # for instance if there is a new audiopump_id
            # console.log "failed to find #{room_slug} for #{username}"

            return reply Boom.resourceGone( "room not found or user not owner" )

          # if user won't stream, don't create a stream
          if not room.will_stream

            console.log "returning because room wont stream"

            reply response: statusCode: 200
            return

          room_update =
            'status.audiopump_id'    : req.payload.data.id
            'status.is_live'         : true
            'status.live.started_at' : start_time
            'status.live.listeners'  : 0

          stream = 
            user       : room.user
            room       : room._id
            started_at : start_time

          stream = new Stream stream

          stream.save ( error, doc ) ->

            if error 
              console.log "error creating stream document"
              console.log error
              
              return failed request, reply, error

            # notify UI the stream is live
            data =
              type   : "status"
              is_live: true
              live: 
                started_at: now( start_time ).format()

            sockets.send room._id, data

            # reset redis count
            redis_key = "#{room._id}:listeners"
            redis.set redis_key, 0

            # save link to current recording on the room
            room_update.stream = doc._id

            Room.update( _id: room._id, room_update )
              .lean()
              .exec ( error, docs_updated ) ->

                if error

                  failed req, reply, error

                  return reply Boom.preconditionFailed( "Database error" )

                if room.notify or not room.notify?

                  # spam all followers about the room!
                  notify_user_is_live room.user, room.info.slug


                reply response: statusCode: 200