get_listeners = lib 'icecast/get_listeners'

module.exports =
  method : 'GET'
  path   : '/api/v1/rooms/{id}/stats'

  config:
    description: """
      Returns amount of users listening this room now
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 410, message: 'Something wrong between server and radio'}
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

  handler: ( req, reply ) ->

    data = aware {}
    data.set 'jobs', 2

    Room
      .findById( req.params.id )
      .select( "_owner likes visits status.is_live" )
      .lean().exec ( error, room ) ->

        if error then return reply Boom.resourceGone error

        if not room? then return reply Boom.resourceGone "Room not found"

        if room.status.is_live

          get_listeners room._owner, ( error, listeners ) ->

            if error then return reply error

            data.set 'listeners', listeners
            data.set 'jobs', data.get( "jobs" ) - 1

        else
          data.set 'listeners', 0
          data.set 'jobs', data.get( "jobs" ) - 1

        data.set 'room', room
        data.set 'jobs', data.get( "jobs" ) - 1

    data.on 'listeners', ( number ) ->

      pusher.trigger req.params.id , "listeners", number

    data.on 'jobs', ( number ) ->

      if number isnt 0 then return

      reply 
        listeners : data.get( 'listeners' )
        likes     : data.get( 'room' ).likes
        visits    : data.get( 'room' ).visits