extract_id   = lib 'cloudinary/extract_id'
delete_image = lib 'cloudinary/delete'

fb_scrape    = lib 'facebook/scrape'

notify_set_published  = lib 'renotifier/set_published'

module.exports =
  method : 'PUT'
  path   : '/api/v1/tape/{id}'

  config:
    description: "Edit a properties of a tape"
    plugins: "hapi-swagger": responseMessages: [
      { code: 200, message: 'OK' }
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    # validate:
    #   payload:

    #     title     : joi.string()
    #     location  : joi.string()
    #     about     : joi.string()
    #     cover_url : joi.string()
    #     genres    : joi.array()
    #     public    : joi.boolean()

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id  = req.auth.credentials.user._id
      username = req.auth.credentials.user.username
      tape_id  = req.params.id
      payload  = req.payload

      query =
        _id   : tape_id
        user  : user_id

      Tape.findOne( query )
        .select( "_id cover_url slug user" )
        .populate( "user", "info.username" )
        .lean()
        .exec ( error, tape ) -> 

          if error

            failed req, reply, error

            return reply Boom.preconditionFailed( "Database error" )

          if not tape 

            return reply Boom.resourceGone( "tape not found or user not owner" )

          update = {}
          
          if payload.title?.length
            update.title = payload.title
            # update.slug  = slug payload.title.toLowerCase()

          if payload.location?.length
            update.location = payload.location

          if payload.about?.length
            update.about = payload.about

          if payload.cover_url?.length
            update.cover_url = payload.cover_url

            new_id     = extract_id payload.cover_url
            if tape.cover_url
              
              current_id = extract_id tape.cover_url

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

          if payload.genres? 
            # force lowercase
            payload.genres          = _.map payload.genres, ( g ) -> g.toLowerCase()
            update.genres = payload.genres 

          if payload.public? then update.public = payload.public 
            

          data =
            _id  : tape_id
            data : payload
            type : "update"

          sockets.send tape_id, data

          Tape.update( _id: tape_id, update )
            .lean()
            .exec ( error, docs_updated ) ->

              if error

                failed req, reply, error

                return reply Boom.preconditionFailed( "Database error" )

              Tape
                .findOne( _id: tape_id )
                .select( "slug" )
                .lean()
                .exec ( error, tape ) ->

                  # if public notify users about a new set
                  if payload.public
                    # spam all followers about the new set !
                    notify_set_published user_id, tape.slug
                  
                  url = "#{s.base_path}/#{username}/r/#{tape.slug}"

                  fb_scrape( url )
          
              reply update