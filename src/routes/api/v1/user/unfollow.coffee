unlike = lib 'user/unlike'

module.exports =
  method : 'PUT'
  path   : '/api/v1/user/{id}/unfollow'

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

      user         = req.auth.credentials.user
      following_id = req.params.id

      data = 
        type     : 'unlike'
        username : user.username
        name     : user.name
        avatar   : user.avatar

      sockets.send user._id, data

      unlike user._id, following_id, ( error, response ) ->

        if error then return reply error: error
        
        reply response