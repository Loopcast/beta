template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/'
  config:

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply )->

      url = '/index'

      # always inject user data into requests
      data = request.auth.credentials || {}

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error