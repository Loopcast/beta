###

Load rooms data then render rooms layout

###

load     = models 'rooms'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/rooms'

  config:
    validate:
      query:
        page: joi.number().default 0
        tags: joi.string().default ''

  handler: ( req, reply )->

    page = req.query.page
    tags = req.query.tags

    if tags
      tags = req.query.tags.split(",")
    else
      tags = []

    load page, tags, ( error, data ) ->

      if error then return reply error

      url = "/explore" + req.url.pathname

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error