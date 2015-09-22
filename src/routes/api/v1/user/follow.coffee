like = lib 'user/like'

module.exports =
  method : 'PUT'
  path   : '/api/v1/user/{id}/follow'

  config:
    description: "Start following a user"
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

      if user._id is following_id

        # user can't follow themselves
        return reply ok: 1

      data = 
        type     : 'like'
        username : user.username
        name     : user.name
        avatar   : user.avatar

      sockets.send following_id, data

      like user._id, following_id, ( error, respose ) ->

        if error then return reply error: error.message
        
        reply respose