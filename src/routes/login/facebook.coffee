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

              intercom.createUser data, ( error, res ) ->

                if error
                  console.log "error creating user at intercom"
                  console.log JSON.stringify( error, null, 2)

                  return

                console.log "created intercom user!! ->", res

            else

              # maybe update last_seen_user_agent or integrate this from
              # client side intercom
              console.log " -> user already on intercom"
              # console.log res

          # redirect to succesful login
          return reply.redirect '/login/successful'