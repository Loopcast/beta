###
# Fetches public information for a given profile
###
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

      live     :
        title    : "Last Saturday Set"
        about    : "Description of the room"
        author   : "Thomas Amundsen"
        kind     : "Dj/Producer"
        genres   : [ "House", "Tech House", "Electro House" ]
        location : "London/UK"
        loves    : 26
        plays    : 273
        guests   : 10
        url      : "/thomas/last-saturday-set"
        cover    : "/images/homepage.jpg"

      recorded : [
          id       : "recorded_id_1"
          title    : "Last Saturday Set"
          about    : "Description of the room"
          author   : "Thomas Amundsen"
          kind     : "Dj/Producer"
          genres   : [ "House", "Tech House", "Electro House" ]
          location : "London/UK"
          loves    : 26
          plays    : 273
          guests   : 12
          url      : "/thomas/last-saturday-set"
          cover    : "/images/homepage.jpg"
        ,
          id       : "recorded_id_2"
          title    : "Last Saturday Set"
          about    : "Description of the room"
          author   : "Thomas Amundsen"
          kind     : "Dj/Producer"
          genres   : [ "House", "Tech House", "Electro House" ]
          location : "London/UK"
          loves    : 26
          plays    : 273
          guests   : 4
          url      : "/thomas/last-saturday-set"
          cover    : "/images/homepage.jpg"
        ]

    if not profile.genres then profile.genres = []

    if not profile.social then profile.social = []

    callback null, profile