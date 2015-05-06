User      = schema 'user'
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

      User
        .findOne( 'data.facebook.id': credentials.profile.id )
        .lean().exec ( error, user ) ->

          # if found, just update aware
          if user then return data.set 'user', user

          # populates user informaiton with facebook data
          transform credentials, ( error, user ) ->

            if error then return reply error

            create user, ( error, user ) ->
              if error 
                console.log "error creating user ->", error
                
                return reply Boom.expectationFailed 'couldnt create user, please contact support'

              data.set 'user', user

      data.on 'user', ( user ) ->

        # NOTE: might not be good idea to save user_id on the session
        # let's not print this on the source code, so user can never
        # figure out other user database _id !
        user.info._id = user._id

        request.auth.session.set user: user.info

        return reply.redirect '/login/successful'