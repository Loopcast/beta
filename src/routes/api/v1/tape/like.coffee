like = lib 'likes/add'

module.exports =
  method : 'PUT'
  path   : '/api/v1/tape/{id}/like'

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
      tape_id = req.params.id

      data = 
        type     : 'like'
        username : user.username
        name     : user.name
        avatar   : user.avatar

      sockets.send tape_id, data

      like user._id, 'tape', tape_id, ( error, respose ) ->

        if error then return reply error: error.message
        
        reply respose