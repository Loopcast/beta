slug = require 'slug'
Room = schema 'room'

module.exports =
  method : 'PUT'
  path   : '/api/v1/user/{username}/unfollow'

  config:
    description: "Stop following a user"
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

      user     = req.auth.credentials.user
      username = req.params.username

      reply ok: true

      # update:
      #   likes:
      #     users: $push : req.auth.credentials.user.id
      #     counter: $inc: 1

      # Room.update( _id: room_id, update )
      #   .lean()
      #   .exec ( error, docs_updated ) ->

      #     if error

      #       failed req, reply, error

      #       return reply Boom.preconditionFailed( "Database error" )

      #     reply update