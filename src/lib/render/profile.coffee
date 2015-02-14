load     = models 'profile'
template = lib 'render/template'

module.exports = ( url, data, callback ) ->

    if url.substr( 0, 1 ) is '/' then url = url.substr 1

    console.log "loading profile id ->", url

    load url, ( error, profile ) ->

      if error then return reply error

      image_id = "sample"

      # appends profile information to data object
      data.profile = profile

      data.cloudinary = 
        api_key    : s.cloudinary.api_key
        cloud_name : s.cloudinary.cloud_name
        unsigned_id: s.cloudinary.api_unsigned_id

      template '/profile', data, ( error, response ) ->

        if error then return callback error

        callback null, response