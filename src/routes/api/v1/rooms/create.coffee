slug = require 'slug'
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
        genres   : joi.string()
        location : joi.string()
        about    : joi.string()
        cover    : joi.any()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply error: 'needs_authentication'

      user    = request.auth.credentials.user

      payload = request.payload
      payload.genres = payload.genres.split ','

      if not payload.genres.length then delete payload.genres

      doc = 
        info:
          owner_user : user.username
          title      : payload.title
          slug       : slug payload.title.toLowerCase()
          genres     : payload.genres
          location   : payload.location
          about      : payload.about

      doc.url = "#{user.username}/#{doc.info.slug}"
      # doc.updated_at = doc.created_at = now().toDate()

      if payload.cover
        doc.info.cover = payload.cover.secure_url
        doc.images     = cover: payload.cover

      room = new Room doc

      room.save ( error, doc ) ->

        if error then return failed request, reply, error

        reply doc