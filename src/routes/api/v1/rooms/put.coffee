###

Updates cover image for a given Room

###

module.exports =
  method : 'PUT'
  path   : '/api/v1/room/{id}/cover'

  config:
    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')
      
      reply recording: true