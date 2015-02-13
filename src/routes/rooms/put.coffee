###

Updates cover image for a given Room

###

module.exports =
  method : 'PUT'
  path   : '/room/{id}/cover'

  config:
    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply error: 'needs_authentication'
      
      reply recording: true