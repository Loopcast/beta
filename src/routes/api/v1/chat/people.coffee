module.exports =
  method : 'GET'
  path   : '/api/v1/chat/{id}/people'

  config:
    description: """
      Returns a list of people in the room
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( req, reply )->

    Room
      .findOne( _id: req.params.id )
      .select( "in_chat" )
      .lean()
      .exec ( error, response ) ->

        clients = response.in_chat

        if not clients 

          console.log "no users in this room !"

          return reply 
            sockets: clients
            users  : []

        query = socket_id: $in: clients

        User
          .find( query )
          .select( "socket_id info.name info.username info.occupation info.avatar likes" )
          .lean()
          .exec ( error, response ) ->

            if error then return reply Boom.badRequest "user not found"

            reply
              sockets: clients
              users  : response