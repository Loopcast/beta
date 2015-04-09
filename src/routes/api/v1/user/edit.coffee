###

Updates cover image for a given Room

###

module.exports =
  method : 'POST'
  path   : '/api/v1/user/edit'

  config:
    description: "Create room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 422, message: 'Error fetching user information' } # Boom.badData
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    # TODO: write the corret validation
    # validate:
    #   payload:
    #     title    : joi.string().required()
    #     genres   : joi.string()
    #     location : joi.string()
    #     about    : joi.string()
    #     cover    : joi.any()

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized 'needs authentication'

      user = request.auth.credentials.user

      console.log 'payload ->', request.payload

      intercom.getUser user_id: user.username, ( error, response ) ->

        if error 
          console.log "error fetching user data"
          console.log user

          return reply Boom.badData 'error fetching user information'

        console.log "got user from intercom:", response

        update = id: response.id

        # top info on profile page
        if request.payload.user_id
          update.user_id = request.payload.user_id

        if request.payload.name
          update.name = request.payload.name

        if request.payload.occupation
          update.custom_attributes = update.custom_attributes || {}
          update.custom_attributes.occupation = request.payload.occupation

        if request.payload.genres
          update.custom_attributes = update.custom_attributes || {}
          update.custom_attributes.genres = request.payload.genres.join( "," )


        # left bar info
        if request.payload.followers
          update.custom_attributes = update.custom_attributes || {}

          update.custom_attributes.followers = request.payload.followers

        if request.payload.about
          update.custom_attributes = update.custom_attributes || {}

          update.custom_attributes.about = request.payload.about



        intercom.updateUser update, ( error, res ) ->

          if error 
            console.log "error while updating user"
            console.log user

            return reply Boom.badData 'error updating user data'

          # console.log "got response from updated user", res

          reply edited: true