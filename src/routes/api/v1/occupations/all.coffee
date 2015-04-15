module.exports =
  method : 'GET'
  path   : '/api/v1/occupations/all'

  config:
    description: "Returns a list of occupations"
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( request, reply )->

    reply [
      "DJ/Producer"
      "Record Label"
      "Agency"
      "Promoter"
      "Club"
      "Festival"
      "Listener"
      "Radio Station"
      "Podcaster"
    ]