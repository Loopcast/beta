load = models 'rooms'

module.exports =
  method : 'POST'
  path   : '/api/v1/rooms'

  config:
    description: """
      Returns a list of rooms,
      - filterable by tags
      - paginable via page parameter
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    validate:
      payload:
        page : joi.number().default 0
        tags : joi.array().default  []

  handler: ( req, reply )->

    page = req.payload.page
    tags = req.payload.tags

    load page, tags, ( error, data ) ->

      if error then return failed req, reply, error

      reply data