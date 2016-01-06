###

Load rooms data then render rooms layout

###

template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/newhome'
  handler: ( request, reply )->

    url = "/newhome"

    data = {}
    
    template url, data, ( error, response ) ->

      if not error then return reply response

      reply error