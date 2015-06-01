module.exports = 
  method: ['GET', 'POST']
  path  : '/login/twitter'
  config:
    auth:
        strategy: 'twitter'
        mode    : 'try'

    handler: ( request, reply ) ->

      if !request.auth.isAuthenticated
        return reply('Authentication failed due to: ' + request.auth.error.message);
      else
        console.log "AUTHENTICATED!!!", request.auth
        return reply('we not supporting twitter atm')
        # request.auth.session.set request.auth.credentials