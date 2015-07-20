find_by   = find 'users/by'
create    = lib 'user/create'
transform = models 'transforms/facebook_to_user'

module.exports = 
  method: ['GET', 'POST']
  path  : '/login/facebook'
  config:
    auth:
        strategy: 'facebook'
        mode    : 'try'

    handler: ( request, reply ) ->

      if !request.auth.isAuthenticated

        console.log "! authenticaiton failed!"
        console.log request.auth.error.message

        # redirect to login again
        return reply.redirect '/login'

      data        = aware {}
      credentials = request.auth.credentials

      email = credentials.profile.email

      if email

        find_by 'data.email': email, ( error, user ) -> 

          if user then return data.set 'user', user

          # find by google id
          find_by 'data.facebook.id': credentials.profile.id, ( error, user ) ->

            if user then return data.set 'user', user

            data.set 'not_found', true

      else

        # find by facebook id
        find_by 'data.facebook.id': credentials.profile.id, ( error, user ) ->

          if user then return data.set 'user', user

          data.set 'not_found', true


      # create user if not found
      data.on 'not_found', ->

        # populates user informaiton with facebook data
        transform credentials, ( error, user ) ->

          if error then return reply error

          create user, ( error, user ) ->
            if error then return reply error

            data.set 'user', user

      data.on 'user', ( user ) ->

        # NOTE: might not be good idea to save user_id on the session
        # let's not print this on the source code, so user can never
        # figure out other user database _id !
        user.info._id        = user._id
        user.info.created_at = user.created_at
        user.info.email      = user.data.email

        # true only when the user didnt exist
        user.info.first_time = data.get( 'not_found' )

        request.auth.session.set user: user.info

        return reply.redirect '/login/successful'