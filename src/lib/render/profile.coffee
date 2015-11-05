load        = models 'profile'
template    = lib 'render/template'

module.exports = ( username, credentials, callback ) ->

    # remove flash if it's first or last character
    username = username.replace( /^\/|\/$/g, '' )

    show_private = credentials?.user.username == username

    load username, show_private, ( error, data ) ->

      if error then return callback error

      template '/profile', data, ( error, response ) ->

        if error then return callback error

        callback null, response