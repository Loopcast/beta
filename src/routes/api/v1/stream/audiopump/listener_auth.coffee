module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/listener_auth'

  config:

    description: "Callback by icecast server when a listener connects to the stream"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      path = req.payload.data.path.split( "/" )[1]

      cred = req.payload.data.requestHeaders.authorization.split( " " )[1]
      cred = new Buffer( pass, 'base64' ).toString( "ascii" )

      user = cred.substr( 0, cred.indexOf( ":" ) )
      pass = cred.substr( cred.indexOf( ":" ) + 1 )

      console.log '- audiopump/listener_auth'

      console.log 'path: ', path
      console.log 'audiopump_id:', req.payload.data.id
      console.log 'user: ', user
      console.log 'pass: ', pass

      console.log '-- eo -- '

      reply().header( "icecast-auth-user", "1" )