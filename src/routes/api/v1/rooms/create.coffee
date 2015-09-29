slug = require 'slug'
Room = schema 'room'

module.exports =
  method : 'POST'
  path   : '/api/v1/rooms/create'

  config:

    description: "Create room"
    plugins: "hapi-swagger": responseMessages: [
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
        genres   : joi.any()
        location : joi.any()
        about    : joi.any()
        cover    : joi.any()

    # response: schema:
    #   error : joi.any()
    #   _id   : joi.any()

    handler: ( request, reply ) ->

      if not request.auth.isAuthenticated

        return reply Boom.unauthorized('needs authentication')

      user    = request.auth.credentials.user

      payload = request.payload

      if payload.genres.length > 0
        payload.genres = payload.genres.split ','
      else
        payload.genres = []

      payload.genres = _.map payload.genres, ( g ) -> g.toLowerCase()

      doc = 
        user       : user._id
        created_at : now().toDate()
        info:
          user     : user.username
          title    : payload.title
          slug     : slug payload.title.toLowerCase()
          genres   : payload.genres
          location : payload.location
          about    : payload.about

      if payload.cover
        doc.info.cover_url = payload.cover

      room = new Room doc

      room.save ( error, doc ) ->

        if error 
          console.log "error creating room ->", error
          
          return failed request, reply, error

        # returns only the data, not the mongoose crap
        reply doc.toObject()