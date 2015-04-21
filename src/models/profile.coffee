###
# Fetches public information for a given profile
###

Room = schema 'room'

module.exports = ( id, callback ) ->

  # if somebody types Uppercase letters, we read as lowercase
  id = id.toLowerCase()

  intercom.getUser user_id: id, ( error, intercom ) ->

    profile =
      id         : intercom.user_id

      # top bar info
      name       : intercom.name
      occupation : intercom.custom_attributes.occupation
      genres     : intercom.custom_attributes.genres?.split ','

      # left bar info
      about     : intercom.custom_attributes.about
      location  : intercom.custom_attributes.location
      social    : intercom.custom_attributes.social?.split ','

      avatar    : intercom.custom_attributes.avatar
      cover     : intercom.custom_attributes.cover

      followers : intercom.custom_attributes.followers || 0
      streams   : intercom.custom_attributes.streams   || 0
      listeners : intercom.custom_attributes.listeners || 0

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
          profile.recorded.push item

      callback null, profile