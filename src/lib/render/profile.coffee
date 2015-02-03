load     = models 'profile'
template = lib 'render/template'

module.exports = ( url, callback ) ->

    if url.substr( 0, 1 ) is '/' then url = url.substr 1

    console.log "loading profile id ->", url

    load url, ( error, data ) ->

      if error then return reply error

      template '/profile', data, ( error, response ) ->

        if error then return callback error

        callback null, response