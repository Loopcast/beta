module.exports =
  method : 'POST'
  path   : '/api/v1/room/create'

  config:

    description: "Create room"
    plugins: "hapi-swagger:": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        title : joi.string().required()
        genre : joi.string().default( "" )

    response: schema:
      error : joi.any()
      id    : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply error: 'needs_authentication'

      user    = request.auth.credentials

      payload = request.payload
      payload.genre = payload.genre.split ','
      
      reply recording: true