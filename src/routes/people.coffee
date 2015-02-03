###

Load rooms data then render rooms layout

###

load     = models 'people'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/people'
  handler: ( request, reply )->

    url = request.url.href

    load ( error, data ) ->

      if error then return reply error

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error