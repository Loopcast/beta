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

      user = 
        _id : user._id
        name: user.name

      # broadcast message "followed_by" to channel "following_id" passing 
      # user as data
      pusher.trigger following_id, "followed_by", user

      like user._id, following_id, ( error, respose ) ->

        if error then return reply error: error.message
        
        reply respose