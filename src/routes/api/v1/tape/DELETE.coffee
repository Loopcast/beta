set_private = lib 's3/set_private'

module.exports =
  method : 'DELETE'
  path   : '/api/v1/tape/{id}'

  config:
    description: "Mark a tape as deleted, but don't delete cover or file at S3"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 410, message: 'Gone' } # Boom.resourceGone
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user_id = req.auth.credentials.user._id
      tape_id = req.params.id

      query =
        _id  : tape_id
        user : user_id

      update = $set: deleted: true

      Tape
        .update( query, update )
        .lean().exec ( error, updated ) ->

          if error

            console.log 'error updating tape deleted property'
            console.log error
            return reply Boom.error error, error.message

          reply updated

      Tape.findOne( query )
        .select( "s3" )
        .lean().exec ( error, tape ) -> 
        

          if not tape

            return reply Boom.resourceGone();

          # delete cover image from cloudinary
          # if tape.cover_url
              
          #   current_id = extract_id tape.cover_url

          #   delete_image current_id, ( error, result ) ->
          #     if error
          #       console.log "error deleting old cover from cloudinary"
          #       console.log error

          # delete recorded set from s3
          # if tape.s3

          #   set_private tape.s3.key, ( error, data ) ->

          #     if error
          #       console.error "error setting set to private @ s3!!"
          #       console.error error
                
          #       return