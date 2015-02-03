module.exports =

  method : 'GET'
  path   : '/{profile}'

  handler: ( request, reply) ->

    reply "Hello you asked for profile:" + request.params.profile