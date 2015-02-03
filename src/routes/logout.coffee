###

Logs user out

###

module.exports =
  method : 'GET'
  path   : '/logout'
  handler: ( request, reply ) ->

      reply.redirect '/'