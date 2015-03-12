###

Load rooms data then render rooms layout

###

load     = models 'about'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/about'
  handler: ( request, reply )->

    url = "/about"

    load ( error, data ) ->

      if error then return reply error

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error