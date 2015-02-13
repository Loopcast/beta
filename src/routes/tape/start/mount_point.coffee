###

Validates user credentials then send recording message to recording backend

###

module.exports =
  method : 'POST'
  path   : '/tape/start/{mount_point}'

  config:
    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply error: 'needs_authentication'

      reply recording: true