slug = require 'slug'
Room = schema 'room'

mongoose = require 'mongoose'

module.exports =
  method : 'POST'
  path   : '/api/v1/tape/stop'

  config:

    description: "Stop recording"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' }
      { code: 410, message: "Room not found or user not owner" }
      { code: 412, message: "Database error" }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        room_id  : joi.string().required()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id  = req.auth.credentials.user._id
      username = req.auth.credentials.user.username
      room_id  = req.payload.room_id

      query =
        _id  : room_id
        user : user_id

      Room.findOne( query )
        .select( "_id user info recording" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          update =
            $set:
              'status.is_recording'         : off
              'status.recording.stopped_at' : now().format()

          options = 
            fields:
              _id                           : off
              'status.recording.started_at' : on
              'status.recording.stopped_at' : on
              'status.is_recording'         : on

          data =
            url: "#{s.tape.url}/api/v1/stop"
            form:
              tape : room.recording.toString()

          console.log 'posting data.form ->', data.form

          request.post data, ( error, response, body ) ->

            if error

              console.log "error stopping tape"
              console.log error

              return      

            # JSON from tape server
            body = JSON.parse body

            if body.error?

              console.error "error stopping tape for room #{room_id}"

              console.error body.error

              reply body
            
            Room.findAndModify query, null, update, options, ( error, response ) ->

              # TODO: don't reply if already replied with error
              if error then return failed request, reply, error

              started_at = now( response.value.status.recording.started_at )
              stopped_at = now( update.$set['status.recording.stopped_at'] )

              duration = stopped_at.diff( started_at, 'seconds' )
              
              rec_update = 
                stopped_at: update.$set['status.recording.stopped_at']
                duration  : duration

                # slug      : room.info.slug
                title     : room.info.title
                genres    : room.info.genres
                location  : room.info.location
                about     : room.info.about
                cover_url : room.info.cover_url
                error     : body.error

              update = 'status.recording.duration': duration

              Room.update _id: room._id, update, ( error, response ) ->

                if error
                  console.log 'error updating recording duration'
                  console.log 'error ->', error

              # recorded for this length
              console.log "Recorded #{duration} seconds"

              if not body.error?
                # return the ROOM so the client side can show the information
                # and also show the publish modal with the link to publish
                # this tape
                reply room: room

              update = ->
                Tape
                  .update( _id: room.recording, rec_update )
                  .lean()
                  .exec ( error, docs_updated ) ->

                    if error 
                      console.log "error updating tape document"
                      console.log error
                      
                      # TODO: don't reply if already replied with error
                      return failed request, reply, error

              # if no cover, just update
              return update() if not room.info.cover_url

              cloudinary.uploader.upload room.info.cover_url, ( result ) ->

                if not result.secure_url
                  console.log 'error updating cloning image for tape'
                  console.log result

                else
                  rec_update.cover_url = result.secure_url

                update()