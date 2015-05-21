unlike = lib 'rooms/unlike'

module.exports =
  method : 'PUT'
  path   : '/api/v1/rooms/{id}/unlike'

  config:
    description: "Unlike a room"
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    handler: ( req, reply ) ->

      if not req.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user    = req.auth.credentials.user
      room_id = req.params.id

      unlike user._id, room_id, ( error, response ) ->

        if error then return reply error: error
        
        reply response