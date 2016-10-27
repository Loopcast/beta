template = lib 'render/template'
#find     = find 'rooms'

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

      # ~ fetch rooms
      query = featured: true

      fields  =
        user  : 1
        info  : 1
        status: 1
        likes : 1

      options = {}
        #sort :
          #'status.live.started_at': -1

        #limit: page_limit
        #skip : page_limit * page

      console.log 'find is ->', find

      find( 'rooms' ) query, fields, options, ( error, rooms ) ->

        console.log 'hello find!', arguments

        if error then return callback error

        data.rooms = rooms

        template url, data, ( error, response ) ->

          if not error then return reply response

          reply error
