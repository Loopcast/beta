module.exports =
  method : 'GET'
  path   : '/api/v1/rooms/{id}/people'

  config:
    description: """
      Returns a list of people in the room
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( req, reply )->

    id     = req.params.id

    clients = sockets.io.sockets.adapter.rooms[id]

    if not clients 

      console.log "no users in this room !"
      
      return reply []

    console.log "looking for users with socket_id ->", Object.keys clients

    query = socket_id: Object.keys clients

    User
      .find( query )
      .select( "info.name info.username info.occupation info.avatar likes" )
      .lean()
      .exec ( error, response ) ->

        if error then return reply Boom.badRequest "user not found"

        reply response