slug = require 'slug'

module.exports =
  method : 'POST'
  path   : '/api/v1/rooms/is_available'

  config:
    description: """
      Returns information about a room and it's owner
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 400, message: 'Bad Request' }
      { code: 401, message: 'Needs authentication' } # Boom.unauthorized
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

    validate:
      payload:
        title : joi.string().required()

  handler: ( req, reply ) ->

    if not req.auth.isAuthenticated

      return reply Boom.unauthorized('needs authentication')

    owner_id = req.auth.credentials._id
    title    = slug req.payload.title.toLowerCase()

    query = 
      _owner     : owner_id
      'info.slug': title

    Room.find( query, _id: off )
      .where( "status.is_live", true )
      .select( "url" )
      .lean()
      .exec ( error, room ) -> 
        if error then failed null, null, error

        if room.length then return reply available: false

        return reply available: true