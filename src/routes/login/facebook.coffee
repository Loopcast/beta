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

        username = credentials.profile.email
        username = username.substr 0, username.indexOf '@'

        session = username: username

        request.auth.session.set session

        # redirect to succesful login
        return reply.redirect '/login/successful'