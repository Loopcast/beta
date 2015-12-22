extract_id   = lib 'cloudinary/extract_id'
delete_image = lib 'cloudinary/delete'

fb_scrape    = lib 'facebook/scrape'

module.exports =
  method : 'PUT'
  path   : '/api/v1/rooms/{id}'

  config:
    description: "Edit a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        title     : joi.string()
        location  : joi.any()
        about     : joi.any()
        cover_url : joi.string()
        genres    : joi.any()
        is_public : joi.boolean()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user    = req.auth.credentials.user
      room_id = req.params.id
      payload = req.payload

      query =
        _id   : room_id
        user  : user._id

      Room.findOne( query )
        .select( "_id info.cover_url user info.slug" )
        .populate( "user", "info.username" )
        .lean()
        .exec ( error, room ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not room 

            return reply Boom.resourceGone( "room not found or user not owner" )

          update = {}
          
          if payload.title
            update[ 'info.title' ] = payload.title
            update[ 'info.slug' ]  = slug payload.title.toLowerCase()

          if payload.location
            update[ 'info.location' ] = payload.location

          if payload.about
            update[ 'info.about' ] = payload.about

          if payload.cover_url
            update[ 'info.cover_url' ] = payload.cover_url

            # Problem while updating the cover of a room from the profile page
            # room.info.cover_url is undefined
            new_id     = extract_id payload.cover_url
            if room.info.cover_url
              
              current_id = extract_id room.info.cover_url

              if current_id != new_id
                console.log 'will remove old cover fromcloudinary'

                delete_image current_id, ( error, result ) ->
                  if error
                    console.log "error deleting old cover from cloudinary"
                    console.log error

                  # TESTED: WORKS!
                  # else
                  #   console.log 'succesfully deleted old cover from cloudinary'
                  #   console.log result

          if payload.genres
            # force lowercase
            payload.genres          = _.map payload.genres, ( g ) -> g.toLowerCase()
            update[ 'info.genres' ] = payload.genres

          if payload.is_public
            update[ 'status.is_public' ] = payload.is_public

          data =
            _id   : room_id
            type  : "room:update"
            room  : payload

          sockets.send room_id, data

          Room.update( _id: room_id, update )
            .lean()
            .exec ( error, docs_updated ) ->

              if error

                failed req, reply, error

                return reply Boom.preconditionFailed( "Database error" )

              room.slug = update[ 'info.slug' ] || room.info.slug

              url = "#{s.base_path}/#{room.user.info.username}/#{room.slug}"

              fb_scrape( url )

              reply update