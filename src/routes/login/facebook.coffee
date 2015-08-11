find_by        = find 'users/by'

update_session = lib 'user/update_session'

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

        # true only when the user didnt exist
        user.info.first_time = data.get( 'not_found' )

        update_session( request, user )

        return reply.redirect '/login/successful'