###

Load rooms data then render rooms layout

###

load     = models 'explore'
template = lib 'render/template'

module.exports =
  method: 'GET'
  path  : '/'

  config:
    validate:
      query:
        page   : joi.number().default 0
        genres : joi.string().default ''
        search : joi.string().default ''

  handler: ( req, reply )->

    page   = req.query.page
    search = req.query.search
    genres = req.query.genres

    if genres
      genres = req.query.genres.split(",")
    else
      genres = []

    load page, genres, search, ( error, data ) ->
      if error then return reply error

#      url = "/explore/explore" + req.url.pathname
      url = "/explore/explore";
      data.url = "/explore/explore"

      if genres.length > 0
        data.current_genre = genres
      else
        data.current_genre = ""


      template url, data, ( error, response ) ->


        if not error then return reply response

        reply error