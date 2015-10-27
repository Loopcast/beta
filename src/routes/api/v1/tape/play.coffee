increase_play = lib 'tape/increase_play'

module.exports =
  method : 'PUT'
  path   : '/api/v1/tape/{id}/play'

  config:
    description: "Count a play for a tape"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      ip = req.headers['x-forwarded-for'] || req.info.remoteAddress

      tape_id = req.params.id

      increase_play ip, tape_id, ( error, response ) ->

        if error then return reply error

        # only if it's a real visit
        if response
          sockets.send tape_id, type: "play"


        reply updated: response