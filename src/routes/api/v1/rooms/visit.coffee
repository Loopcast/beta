increase_visit = lib 'rooms/increase_visit'

module.exports =
  method : 'PUT'
  path   : '/api/v1/rooms/{id}/visit'

  config:
    description: "Count a visit for a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      ip = req.headers['x-forwarded-for'] || req.info.remoteAddress

      room_id = req.params.id

      increase_visit ip, room_id, ( error, response ) ->

        if error then return reply error

        reply updated: response