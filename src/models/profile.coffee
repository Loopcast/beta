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

      # live     :
      #   title    : "Last Saturday Set"
      #   about    : "Description of the room"
      #   author   : "Thomas Amundsen"
      #   kind     : "Dj/Producer"
      #   genres   : [ "House", "Tech House", "Electro House" ]
      #   location : "London/UK"
      #   loves    : 26
      #   plays    : 273
      #   guests   : 10
      #   url      : "/thomas/last-saturday-set"
      #   cover    : "/images/homepage.jpg"

      # recorded : [
      #     id       : "recorded_id_1"
      #     title    : "Last Saturday Set"
      #     about    : "Description of the room"
      #     author   : "Thomas Amundsen"
      #     kind     : "Dj/Producer"
      #     genres   : [ "House", "Tech House", "Electro House" ]
      #     location : "London/UK"
      #     loves    : 26
      #     plays    : 273
      #     guests   : 12
      #     url      : "/thomas/last-saturday-set"
      #     cover    : "/images/homepage.jpg"
      #   ,
      #     id       : "recorded_id_2"
      #     title    : "Last Saturday Set"
      #     about    : "Description of the room"
      #     author   : "Thomas Amundsen"
      #     kind     : "Dj/Producer"
      #     genres   : [ "House", "Tech House", "Electro House" ]
      #     location : "London/UK"
      #     loves    : 26
      #     plays    : 273
      #     guests   : 4
      #     url      : "/thomas/last-saturday-set"
      #     cover    : "/images/homepage.jpg"
      #   ]

    if not profile.genres then profile.genres = []

    if not profile.social then profile.social = []

    if not profile.recorded then profile.recorded = []

    query = 'info.user' : id

    Room.find query, ( error, response ) ->

      if error then return callback error

      for session in response

        item = 
          title     : session.info.title
          about     : session.info.about
          location  : session.info.location
          author    : intercom.name
          kind      : profile.occupation
          genres    : session.info.genres
          location  : session.info.location
          plays     : 0
          loves     : 0
          guests    : 0
          url       : "/#{id}/#{session.info.slug}"
          cover     : "/images/profile_session_1.jpg"
          started_at: session.status.started_at
          stopped_at: session.status.stopped_at

        if session.status.is_streaming
          profile.live = item
        else
          profile.recorded.push item

      callback null, profile