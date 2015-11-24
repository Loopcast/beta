Hapi    = require 'hapi'

server      = happens {}

server.hapi    = hapi = new Hapi.Server

  # debug: request: ['error']

server.start = ( when_done ) ->

  hapi.connection 
    port: s.port
    router: stripTrailingSlash: true

  # start!
  hapi.start ->
    console.log 'Server running at:', hapi.info.uri

    hapi.register {
      register: require('hapi-swagger')
      options:
        basePath          : s.base_path
        documentationPath : '/api/documentation'
        # endpoint          : '/api/docs'
        endpoint          : '/docs'
        apiVersion        : pack.version
    }, ( error ) ->
      if error
        console.error 'swagger register error'
        console.error  error

      hapi.register require( "bell" ), ( error ) ->

        hapi.register require( 'hapi-auth-cookie' ), ( error ) ->

          # see this page for documentation:
          # https://github.com/hapijs/hapi-auth-cookie
          hapi.auth.strategy 'session', 'cookie',
            password   : '798746534986541324898675421657421'
            cookie     : 'sid-example'
            # redirectTo : '/login'
            isSecure   : s.https
            appendNext : true

          hapi.auth.strategy 'facebook', 'bell',
            provider       : 'facebook',
            password       : 'cookie_encryption_password',
            clientId       : s.facebook.app.id
            clientSecret   : s.facebook.app.secret
            isSecure       : s.https
            providerParams : s.facebook.provider_params
            
          hapi.auth.strategy 'google', 'bell',
            scope: [
              'profile'
            ]
            provider      : 'google',
            password      : 'cookie_encryption_password',
            clientId      : s.google.id
            clientSecret  : s.google.secret
            isSecure      : s.https
            providerParams: s.google.provider_params

          # hapi.auth.strategy 'soundcloud', 'bell',
          #   provider    : 'soundcloud',
          #   password    : 'cookie_encryption_password',
          #   clientId    : s.soundcloud.id
          #   clientSecret: s.soundcloud.secret
          #   isSecure    : s.https

          when_done()

module.exports = server