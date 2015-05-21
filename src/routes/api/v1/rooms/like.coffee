increase_like = lib 'rooms/increase_like'

module.exports =
  method : 'PUT'
  path   : '/api/v1/rooms/{id}/like'

  config:
    description: "Like a room in case it wasnt linked before"
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

      doc =
        user_id  : user._id
        type     : 'room'
        liked_id : room_id
        start    : now().toDate()

      like = new Like doc

      like.save ( error, doc ) ->

        if error

          return reply error: error.message

        # +1 on the counter
        increase_like room_id, 1

        reply doc.toObject()