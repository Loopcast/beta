transform = models 'transforms/facebook_to_session'

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


        transform credentials, ( error, session ) ->

          if error then return reply error

          request.auth.session.set session

          # redirect to succesful login
          return reply.redirect '/login/successful'