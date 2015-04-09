###

Updates user's profile information

###

transform = models 'transforms/name_to_username'

module.exports =
  method : 'POST'
  path   : '/api/v1/user/edit'

  config:
    description: "Create room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 409, message: 'Error updating user name ' } # Boom.conflict
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

      console.log "payload ->", request.payload

      # save user data to intercom
      save = ( user_data ) ->
        intercom.updateUser user_data, ( error, res ) ->

          if error 
            console.log "error while updating user"
            console.log user

            return reply Boom.badData 'error updating user data'

          # exposes all edited data
          reply user_data

      # fetch user data from intercom
      intercom.getUser user_id: user.username, ( error, response ) ->

        if error
          console.log "error fetching user data"
          console.log user

          return reply Boom.badData 'error fetching user information'

        data = 
          id               : response.id
          custom_attributes: {}

        # top info on profile page
        if request.payload.user_id
          data.user_id = request.payload.user_id

        if request.payload.name
          data.name = request.payload.name

        if request.payload.occupation
          data.custom_attributes.occupation = request.payload.occupation

        if request.payload.genres
          data.custom_attributes.genres = request.payload.genres.join( "," )


        # left bar info
        if request.payload.followers

          data.custom_attributes.followers = request.payload.followers


        if request.payload.location

          data.custom_attributes.location = request.payload.location

        if request.payload.about

          data.custom_attributes.about = request.payload.about

        if request.payload.about

          data.custom_attributes.about = request.payload.about


        # HACK: since we still don't have an interface to update user_id
        # we will be updating user_id everytime a user updates his name
        if data.name and not request.payload.user_id

          transform data.name, ( error, username ) ->
            if error
              console.log "error fetching user data"
              console.log user

              return reply Boom.conflict 'error updating username'

            data.user_id = username

            # save to intercom
            save( data )

        else

          # save to intercom
          save( data )