module.exports =
  method : 'POST'
  path   : '/api/v1/room/create'

  config:

    description: "Create room"
    notes  : [
      "HTTP status codes"
      "200, OK"
      "400, Bad Request ~ something is missing"
      "5**, Error ~ something wrong in our side"
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        title : joi.string().required()
        genre : joi.any().default( "" )

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