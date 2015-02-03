###

Load rooms data then render rooms layout

###

load     = models 'sets'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/sets'
  handler: ( request, reply )->

    url = request.url.href

    load ( error, data ) ->

      if error then return reply error

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error