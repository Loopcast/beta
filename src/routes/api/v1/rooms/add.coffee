###
# validates user credentials then
# create a new room
###

module.exports =
  method : 'POST'
  path   : '/api/v1/room/add'

  config:
    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      if not request.auth.isAuthenticated

        return reply error: 'needs_authentication'
      
      reply recording: true