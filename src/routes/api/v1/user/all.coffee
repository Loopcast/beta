load = models 'rooms'

module.exports =
  method : 'POST'
  path   : '/api/v1/users'

  config:
    description: """
      Returns a list of users,
      - filterable by genres
      - paginable via page parameter
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    validate:
      payload:
        page   : joi.number().default 0
        search : joi.string().default ''
        tags   : joi.array().default  []

  handler: ( req, reply )->

    page   = req.payload.page
    search = req.payload.search
    genres = req.payload.genres

    load page, genres, search, ( error, data ) ->

      if error then return failed req, reply, error

      reply data