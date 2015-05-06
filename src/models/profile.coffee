###
# Fetches public information for a given profile
###


Room = schema 'room'

module.exports = ( id, callback ) ->

  # if somebody types Uppercase letters, we read as lowercase
  id = id.toLowerCase()

  intercom.getUser user_id: id, ( error, data ) ->

    profile =
      id         : data.user_id

      # top bar info
      name       : data.name
      occupation : data.custom_attributes.occupation
      genres     : data.custom_attributes.genres?.split ','

      # left bar info
      about     : data.custom_attributes.about
      location  : data.custom_attributes.location
      social    : data.custom_attributes.social?.split ','

      avatar    : data.custom_attributes.avatar
      cover     : data.custom_attributes.cover

      followers : data.custom_attributes.followers || 0
      streams   : data.custom_attributes.streams   || 0
      listeners : data.custom_attributes.listeners || 0

    if not profile.genres   then profile.genres   = []
    if not profile.social   then profile.social   = []
    if not profile.recorded then profile.recorded = []
    if not profile.cover    then profile.cover = '/images/homepage_2.jpg'
    
    query = 'info.user' : id

    Room.find query, ( error, rooms ) ->

      if error then return callback error

      for room in rooms

        if room.status.is_live
          profile.live = room
        else
          profile.recorded.push room

      callback null, profile