escape = require 'escape-html'

get_all   = lib 'tape/comments/get_all'

module.exports =
  method : 'GET'
  path   : '/api/v1/tape/comments/{tape_id}'

  config:

    description: "Get latest messages for a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( request, reply ) ->

      get_all request.params.tape_id, ( error, response ) -> 

        if error then return reply Boom.resourceGone "Something went wrong"

        reply response