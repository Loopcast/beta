###
# Fetches public information for a given profile
###
transform = lib 'shared/transform'

User = schema 'user'
Room = schema 'room'

module.exports = ( id, callback ) ->

  if id is 'undefined'

    console.log 'id is undefined!'
    console.log 'probably something wrong on the DOM triggering an undefined user'

    return callback 'undefined', null

  # if somebody types Uppercase letters, we read as lowercase
  id = id.toLowerCase()

  User
    .findOne( 'info.username': id )
    .lean().exec ( error, data ) ->

      profile =
        id         : data.info.username

        # top bar info
        name       : data.info.name
        occupation : data.info.occupation
        genres     : data.info.genres

        # left bar info
        about     : data.info.about
        location  : data.info.location
        social    : data.info.social

        avatar    : data.info.avatar
        cover     : data.info.cover
        images    : transform.all data.info.avatar

        followers : data.stats.followers
        streams   : data.stats.streams
        listeners : data.stats.listeners

        # list of rooms
        recorded  : []
        live      : null

      if not profile.cover    then profile.cover = '/images/homepage_2.jpg'
      
      query = '_owner' : data._id

      Room.find query, ( error, rooms ) ->

        if error then return callback error

        for room in rooms

          if room.status.is_live
            profile.live = room
          else
            profile.recorded.push room

        callback null, profile