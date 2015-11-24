send = lib 'tape/comments/send'

module.exports =
  method : 'POST'
  path   : '/api/v1/tape/comment'

  config:

    description: """"
      Save a comment to the recorded set
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1", "todo" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        tape_id : joi.string().required()
        message : joi.string().optional()
        payload : joi.object().optional()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated
        return reply Boom.unauthorized('needs authentication')

      user = request.auth.credentials.user

      tape_id  = request.payload.tape_id
      user_id  = request.payload.user_id

      # build channel string
      # room_subscribe_id    = pusher_tape_id owner_id, tape_id

      data = 
        type    : 'message'
        _id     : user._id
        name    : user.name
        username: user.username
        avatar  : user.avatar
        time    : now().format()
        message : request.payload.message
        payload : request.payload.payload

      # send message
      send tape_id, data

      reply( sent: true ).header "Cache-Control", "no-cache, must-revalidate"
