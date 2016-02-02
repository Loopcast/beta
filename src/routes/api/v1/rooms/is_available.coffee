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

    user_id = req.auth.credentials.user._id
    title   = slug req.payload.title.toLowerCase()

    query = 
      user       : user_id
      'slug': title

    Room.find( query, _id: off )
      # can't have same slug twice
      # .where( "status.is_live", true )
      .select( "url" )
      .lean()
      .exec ( error, room ) -> 
        if error then failed null, null, error

        if room.length then return reply available: false

        return reply available: true