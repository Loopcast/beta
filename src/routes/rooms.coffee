###

Load rooms data then render rooms layout

###

load     = models 'rooms'
template = lib 'render/template'

module.exports =
  method: [ 'GET', 'POST' ]
  path  : '/rooms'
  handler: ( request, reply )->

    page = 0
    tags = []

    load page, tags, ( error, data ) ->

      if error then return reply error

      url = "/explore/" + request.url.href

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error