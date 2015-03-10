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
        reply.redirect '/login'

      else

        credentials = request.auth.credentials


        transform credentials, ( error, user ) ->

          if error then return reply error

          request.auth.session.set user: user.session

          intercom.getUser email: user.data.email, ( error, res ) ->

            if not res

              console.log " -> user not on intercom yet"
              console.log " -> adding!"

              data =
                email : user.data.email
                name  : user.data.facebook.profile.displayName

              intercom.createUser data, ( error, res ) ->

                if error
                  console.log "error creating user at intercom"
                  console.log error

                  return

                console.log "created intercom user!! ->", res

            else

              console.log " -> user already on intercom"
              # console.log res

          # redirect to succesful login
          return reply.redirect '/login/successful'