module.exports = 
  method: ['GET', 'POST']
  path  : '/login/google'
  config:
    auth:
        strategy: 'google'
        mode    : 'try'

    handler: (request, reply) ->

      if !request.auth.isAuthenticated
        return reply('Authentication failed due to: ' + request.auth.error.message);
      else
        console.log "AUTHENTICATED!!!", request.auth

      return reply.redirect('/');