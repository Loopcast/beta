is_liking = lib 'user/is_liking'

module.exports =
  method : 'GET'
  path   : '/api/v1/tape/{id}'

  config:
    description: """
      Returns information about a tape and it's owner
    """
    plugins: "hapi-swagger": responseMessages: [
      { code: 500, message: 'Internal Server Error'}
    ]
    tags   : [ "api", "v1" ]

    auth:
      strategy: 'session'
      mode    : 'try'

  handler: ( req, reply ) ->

    data    = aware {}
    tape_id = req.params.id

    if not req.auth.isAuthenticated
      data.set 'liked': false
    else
      user    = req.auth.credentials.user

      # check if user liked this room
      is_liking user._id, tape_id, 'tape', ( error, response ) ->

        if error then return data.set 'liked', false

        data.set 'liked', response

    Tape
      .findById( req.params.id )
      .populate( "user", "info.name info.username info.avatar info.occupation likes" )
      .select( "user info status likes" )
      .lean().exec ( error, result ) ->

        if error then return reply Boom.resourceGone "Tape not found"

        data.on 'liked', ( liked ) ->

          reply
            tape  : result
            liked : liked