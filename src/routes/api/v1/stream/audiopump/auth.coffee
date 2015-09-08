slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/auth'

  config:

    description: "Callback by icecast server when a broadcasters connects to the server"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      # path = req.payload.data.path.split( "/" )[1]

      # cred = req.payload.data.requestHeaders.authorization.split( " " )[1]
      # cred = new Buffer( cred, 'base64' ).toString( "ascii" )

      # user = cred.substr( 0, cred.indexOf( ":" ) )
      # pass = cred.substr( cred.indexOf( ":" ) + 1 )

      console.log '- audiopump/auth'

      # console.log 'path: ', path
      # console.log 'user: ', user
      # console.log 'pass: ', pass

      # authorized
      if true
        # everybody is allowed! uhuuuu

        return reply()
        
        reply """{
    "response": {
        "statusCode": 200
    }
}"""

      else
        reply """{
    "response": {
        "statusCode": 401,
        "headers": {
            "WWW-Authenticate": "Basic realm=\"AudioPump Auth Test\""
        },
        "body": "Not authorized!  Try reloading to log in again."
    }
}"""