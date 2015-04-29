load     = models 'profile'
template = lib 'render/template'
transform = lib 'shared/transform'

module.exports = ( url, data, callback ) ->

    if url.substr( 0, 1 ) is '/' then url = url.substr 1

    load url, ( error, data ) ->

      if error then return reply error

      if data.live
        data.live.thumb = transform.cover_thumb data.live.images.cover

      if data.recorded
        for room, i in data.recorded
          data.recorded[i].thumb = transform.cover_thumb room.images.cover


      template '/profile', data, ( error, response ) ->

        if error then return callback error

        callback null, response