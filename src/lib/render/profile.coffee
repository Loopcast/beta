load     = models 'profile'
template = lib 'render/template'
check_input = lib 'tools/strings/check_input'

module.exports = ( username, credentials, callback ) ->

    # remove flash if it's first or last character
    username = username.replace( /^\/|\/$/g, '' )

    show_private = credentials?.user.username == username

    load username, show_private, ( error, data ) ->

      if error then return callback error


      # Temp fix
      data.user.info.location = check_input data.user.info.location
      data.user.info.about = check_input data.user.info.about
      
      template '/profile', data, ( error, response ) ->

        if error then return callback error

        callback null, response