load     = models 'privacy'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/privacy'
  handler: ( request, reply )->

    url = "/privacy"

    load ( error, data ) ->

      if error then return reply error

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error