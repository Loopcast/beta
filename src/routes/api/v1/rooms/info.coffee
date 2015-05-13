User = schema 'user'
Room = schema 'room'

module.exports =
  method : 'GET'
  path   : '/api/v1/rooms/{id}/info'

  config:
    description: """
      Returns information about a room and it's owner
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( req, reply ) ->

    Room
      .findById( req.params.id )
      .select( "_owner info status" )
      .lean().exec ( error, room ) ->

        if error then return reply Boom.resourceGone "Room not found"

        User
          .findById( room._owner )
          .select( "info.name info.username" )
          .lean().exec ( error, user ) ->

            if error then return reply Boom.resourceGone "User not found"

            # never reveal user's id
            delete room._owner

            reply
              user : user
              room : room
              liked: Math.random() < 0.5