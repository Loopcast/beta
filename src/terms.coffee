template = lib 'render/template'

module.exports = 

  method : 'GET'
  path   : "/terms"

  config: 
    cache:
      expiresIn: 86400000
      privacy: 'public'

    handler: ( request, reply )->
       
      url = '/terms'

      # always inject user data into requests
      data = request.auth.credentials || {}

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error