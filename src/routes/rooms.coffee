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
        page  : joi.number().default 0
        genres: joi.string().default ''

  handler: ( req, reply )->

    page   = req.query.page
    genres = req.query.genres

    if genres
      genres = req.query.genres.split(",")
    else
      genres = []

    load page, genres, ( error, data ) ->

      if error then return reply error

      url = "/explore" + req.url.pathname

      template url, data, ( error, response ) ->

        if not error then return reply response

        reply error