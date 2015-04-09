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


        # populates user informaiton with facebook data
        transform credentials, ( error, user ) ->

          if error then return reply error

          intercom.getUser email: user.data.email, ( error, intercom ) ->

            if not intercom

              # if not yet on intercom, use facebook info
              request.auth.session.set user: user.session

              console.log " -> adding user to intercom"

              data =
                user_id   : user.session.username
                email     : user.data.email
                name      : user.data.facebook.profile.displayName
                created_at: now().unix()
                last_seen_user_agent: request.headers[ 'user-agent' ]
                # avatar    :
                #   type     : 'avatar'
                #   image_url: user.session.avatar

              intercom.createUser data, ( error, intercom ) ->

                if error
                  console.log "error creating user at intercom"
                  console.log JSON.stringify( error, null, 2)

                  return

                console.log "created intercom user!! ->", intercom

                return reply.redirect '/login/successful'

            else

              # if not yet on intercom, use facebook info

              user.session.username = intercom.user_id
              user.session.name     = intercom.name

              request.auth.session.set user: user.session

              # maybe update last_seen_user_agent or integrate this from
              # client side intercom
              console.log " -> user already on intercom"

              # redirect to succesful login
              return reply.redirect '/login/successful'