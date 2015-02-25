Room = schema 'room'

module.exports =
  method : 'POST'
  path   : '/api/v1/rooms/create'

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
        title    : joi.string().required()
        genre    : joi.string().default( "" )
        location : joi.string()
        about    : joi.string()
        cover    : joi.any()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply error: 'needs_authentication'

      user    = request.auth.credentials

      payload = request.payload
      payload.genre = payload.genre.split ','

      if not payload.genre.length then delete payload.genre

      console.log "user ->", user
      console.log "payload", payload

      doc = 
        user_id: user.username

        info:
          title   : payload.title
          genre   : payload.genre
          location: payload.location
          about   : payload.about

      if payload.cover
        doc.image.cover = payload.cover

      room = new Room doc


      room.save ( error, doc ) ->

        if error then return failed request, reply, error

        console.info 'saved', doc

        reply doc