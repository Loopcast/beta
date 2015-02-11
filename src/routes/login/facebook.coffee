module.exports = 
  method: ['GET', 'POST']
  path  : '/login/facebook'
  config:
    auth:
        strategy: 'facebook'
        mode    : 'try'

    handler: ( request, reply ) ->

      if !request.auth.isAuthenticated

        console.log "Authenticaiton failed!"
        console.log request.auth.error.message

        # redirect to login again
        reply.redirect '/login'

      else
        console.log "AUTHENTICATED!!!", request.auth

        request.auth.session.set request.auth.credentials

        # redirect to succesful login
        return reply.redirect '/login/successful'