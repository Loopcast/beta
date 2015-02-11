g = require './globals'

# save server as global variable as well
g.server = require './server'


server.connection port: s.port

server.start ->
  console.log 'Server running at:', server.info.uri

  server.register require( "bell" ), ( error ) ->

    server.register require( 'hapi-auth-cookie' ), ( error ) ->

      # see this page for documentation:
      # https://github.com/hapijs/hapi-auth-cookie
      server.auth.strategy 'session', 'cookie',
        password   : '798746534986541324898675421657421'
        cookie     : 'sid-example'
        # redirectTo : '/login'
        isSecure   : s.https
        appendNext : true

      server.auth.strategy 'facebook', 'bell',
        provider    : 'facebook',
        password    : 'cookie_encryption_password',
        clientId    : s.facebook.id
        clientSecret: s.facebook.secret
        isSecure    : s.https

      server.auth.strategy 'google', 'bell',
        provider      : 'google',
        password      : 'cookie_encryption_password',
        clientId      : s.google.id
        clientSecret  : s.google.secret
        isSecure      : s.https
        providerParams: s.google.provider_params

      # disabled as we can't fetch user's email ?
      server.auth.strategy 'twitter', 'bell',
        provider    : 'twitter',
        password    : 'cookie_encryption_password',
        clientId    : s.twitter.id
        clientSecret: s.twitter.secret
        isSecure    : s.https

      # server.auth.strategy 'soundcloud', 'bell',
      #   provider    : 'soundcloud',
      #   password    : 'cookie_encryption_password',
      #   clientId    : s.soundcloud.id
      #   clientSecret: s.soundcloud.secret
      #   isSecure    : s.https

      glob = require 'glob'
      glob __dirname + "/routes/**/*.coffee", ( error, files ) ->

        for file in files

          server.route require( file )