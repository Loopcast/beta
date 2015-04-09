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

          # populates "data" with intercom data
          intercom.getUser email: user.data.email, ( error, data ) ->

            if not data

              # if not yet on intercom, use facebook info
              request.auth.session.set user: user.session

              data =
                user_id             : user.session.username
                email               : user.data.email
                name                : user.data.facebook.profile.displayName
                created_at          : now().unix()
                last_seen_user_agent: request.headers[ 'user-agent' ]
                custom_attributes   :
                  avatar: user.session.avatar

              intercom.createUser data, ( error, data ) ->

                if error
                  console.log "error creating user at intercom"
                  console.log JSON.stringify( error, null, 2 )

                  return Boom.expectationFailed 'couldnt create user, please contact support'

                # console.log "created intercom user!! ->", data

                return reply.redirect '/login/successful'

            else

              # if not yet on intercom, use facebook info

              user.session.username = data.user_id
              user.session.name     = data.name

              request.auth.session.set user: user.session

              # console.log " -> user already on intercom"

              return reply.redirect '/login/successful'