###

Check if a jade template exists for a given address, if fails to find a 
template will look for a user profile, if fails will return a 404

###

template = lib 'render/template'
profile  = lib 'render/profile'

module.exports =
  method: 'GET'
  path  : '/'
  handler: ( request, reply )->

    user_is_logged = false

    if user_is_logged then return reply.redirect '/explore'
      
    url = '/index'

    render = ( response ) -> reply response

    template url, ( error, response ) ->

      if not error then return render response

      reply error