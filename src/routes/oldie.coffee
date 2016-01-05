###

Load rooms data then render rooms layout

###

template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/oldie'
  handler: ( request, reply )->

    url = "/oldie"

    template url, {}, ( error, response ) ->

      if not error then return reply response

      reply error