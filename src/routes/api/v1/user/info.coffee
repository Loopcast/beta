like = lib 'user/like'

module.exports =
  method : 'GET'
  path   : '/api/v1/user/{id}/info'

  config:
    description: "Get basic user info"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      query = _id: req.params.id

      User
        .find( query )
        .select( "info.name info.username info.occupation info.avatar likes" )
        .lean()
        .exec ( error, response ) ->

          if error then return reply Boom.badRequest "user not found"

          reply response