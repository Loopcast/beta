###

Logs user out

###

module.exports =
  method : [ 'GET', 'POST' ]
  path   : '/logout'

  handler: ( request, reply ) ->

    if request.auth.session?

      if request.method is "POST"
        reply success: true
      else
        reply.redirect '/'

    else

      if request.method is "POST"
        reply error: code: 'not_logged'
      else
        reply.redirect '/'
    