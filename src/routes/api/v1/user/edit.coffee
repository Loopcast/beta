###

Updates cover image for a given Room

###

module.exports =
  method : 'POST'
  path   : '/api/v1/user/edit'

  config:
    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized 'needs authentication'

      user = request.auth.credentials.user

      intercom.getUser user_id: user.username, ( error, response ) ->

        if error 
          console.log "error fetching user data"
          console.log user

          return reply Boom.badData 'error updating user data'

        console.log "got user from intercom:", response

        update = id: response.id

        if request.payload.followers
          update.custom_attributes = update.custom_attributes || {}

          update.custom_attributes.followers = request.payload.followers

        if request.payload.occupation
          update.custom_attributes = update.custom_attributes || {}

          update.custom_attributes.occupation = request.payload.occupation

        if request.payload.about
          update.custom_attributes = update.custom_attributes || {}

          update.custom_attributes.about = request.payload.about

        if request.payload.genres
          update.custom_attributes = update.custom_attributes || {}

          update.custom_attributes.genres = request.payload.genres.join( "," )

        # updating user_id is an issue at the moment, it's creating a new user
        if request.payload.user_id
          update.user_id = request.payload.user_id

        intercom.updateUser update, ( error, res ) ->

          if error 
            console.log "error while updating user"
            console.log user

            return reply Boom.badData 'error updating user data'

          # console.log "got response from updated user", res

          reply edited: true