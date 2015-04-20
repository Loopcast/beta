module.exports =
  method : 'GET'
  path   : '/api/v1/sets'

  config:
    description: "Returns a list of sets"
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( request, reply )->

    reply [

    ]