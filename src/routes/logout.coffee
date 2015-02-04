###

Logs user out

###

module.exports =
  method : 'GET'
  path   : '/logout'

  handler: ( request, reply ) ->

    request.auth.session.clear()
    reply.redirect '/'