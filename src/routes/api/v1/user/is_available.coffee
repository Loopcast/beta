slug = require 'slug'

module.exports =
  method : 'GET'
  path   : '/api/v1/user/{username}/is_available'

  config:
    description: """
      Returns information about a room and it's owner
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( req, reply ) ->

    username = req.params.username

    query = 'info.username': username

    User.find( query, _id: off )
      # can't have same slug twice
      # .where( "status.is_live", true )
      .select( "url" )
      .lean()
      .exec ( error, room ) -> 
        if error then failed null, null, error

        if room.length then return reply available: false

        return reply available: true