###

Updates user's profile information

###

transform  = models 'transforms/name_to_username'

extract_id    = lib 'cloudinary/extract_id'
delete_images = lib 'cloudinary/delete'

update_intercom = lib 'intercom/update'
update_rooms    = lib 'rooms/update_username'

module.exports =
  method : 'POST'
  path   : '/api/v1/user/edit'

  config:
    description: "Edit user info"
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

      # save user data to intercom
      save = ( user_data ) ->

        query  = _id : user._id
        update = $set: user_data

        User.update query , update, ( error, result ) ->
          if error 
            console.log "error while updating user on mongodb"
            console.log user

            return reply Boom.badData 'error updating user information from mongodb'

          # expose all updated data
          reply user_data

        if user_data['info.username']

          # if user updates his username, we must update his info in all rooms
          # because when searching for rooms we also need to consider username

          username = user_data['info.username']

          update_rooms user._id, username, ( error, callback ) ->
            if error
              console.error "error updating usernames on room"
              console.error error


        update_intercom user_data, ( error ) ->

          if error
            console.error "error updating intercom user information"
            console.error error

      User
        .findById( user._id )
        .lean().exec ( error, user ) ->

          if error
            console.log "error fetching user data"
            console.log user

            return reply Boom.badData 'error fetching user information from mongodb'

          data = {}

          if request.payload.name
            data[ 'info.name'] = request.payload.name

          if request.payload.occupation
            data[ 'info.occupation'] = [].concat( request.payload.occupation )

          if request.payload.genres?
            data[ 'info.genres'] = request.payload.genres

          if request.payload.location?
            data[ 'info.location'] = request.payload.location

          # top info on profile page
          if request.payload.user_id
            data[ 'info.username'] = request.payload.user_id
            # TODO: update all rooms accordingly

          if request.payload.about?
            data[ 'info.about'] = request.payload.about

          if request.payload.social?
            data[ 'info.social'] = request.payload.social

          # store ids to be remove from cloudinary
          remove_from_cloudinary = []

          if request.payload.avatar
            if user.info.avatar
              current_id = extract_id user.info.avatar

              new_id = extract_id request.payload.avatar

              console.log 'current_id ->', current_id
              console.log 'new_id ->'  , new_id

              if current_id != new_id
                remove_from_cloudinary.push current_id

                console.log "new cloudinary image, delete current one!", current_id

            data[ 'info.avatar' ] = request.payload.avatar


          if request.payload.cover
            if user.info.cover
              current_id = extract_id user.info.cover

              new_id = extract_id request.payload.cover

              console.log 'current_id ->', current_id
              console.log 'new_id ->'  , new_id

              if current_id != new_id
                remove_from_cloudinary.push current_id

                # TESTED: WORKS!
                # console.log "new cloudinary image, delete current one!", current_id

            data['info.cover'] = request.payload.cover

          if remove_from_cloudinary.length
            delete_images remove_from_cloudinary, ( error, result ) ->
              if error
                console.log "error deleting image from cloudinary"
                console.log error
              else
                console.log 'succesfully deleted from cloudinary'
                console.log result

          if request.payload.name and not request.payload.user_id

            transform request.payload.name, false, ( error, username ) ->
              if error
                console.log "error fetching user data"
                console.log user

                return reply Boom.conflict 'error updating username'

              data['info.username'] = username
              
              # save to intercom
              save( data )

          else

            # save to intercom
            save( data )