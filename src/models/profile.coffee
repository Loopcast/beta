###
# Fetches public information for a given profile
###
module.exports = ( id, callback ) ->

  # if somebody types Uppercase letters, we read as lowercase
  id = id.toLowerCase()

  intercom.getUser user_id: id, ( error, intercom ) ->

    console.log "got information from intercom ->", intercom

    profile =
      id         : intercom.user_id

      # top bar info
      name       : intercom.name
      occupation : intercom.custom_attributes.occupation
      genres     : intercom.custom_attributes.genres?.split ','

      # left bar info
      about     : intercom.custom_attributes.about

      image    : intercom.custom_attributes.avatar
      followers: 2
      rooms    : 0
      visitors : 2

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

    callback null, profile