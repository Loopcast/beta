load     = models 'terms'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/terms'
  handler: ( request, reply )->

    url = "/terms"

    load ( error, data ) ->

      if error then return reply error

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error