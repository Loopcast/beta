module.exports =
  method : 'GET'
  path   : '/api/v1/genres/all'

  config:
    description: "Returns a list of genres"
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( request, reply )->

    reply [
      "House"
      "Tech House"
      "Electro House"
      "Ambient"
      "Alternative"
      "Experimental"
      "Reggae"
      "Ska"
      "Fusion"
      "Funky"
      "Punk"
      "Metal"
    ]