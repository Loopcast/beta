###
# Fetches public information for a given profile
###
module.exports = ( id, callback ) ->


  callback null, profile =
    id: id
    name     : id
    kind     : 'Dj/Producer'
    genres   : [ "Deep House", "Disco", "Tech House", "Techno" ]
    image    : "https://i1.sndcdn.com/avatars-000022492215-m1pv0f-t500x500.jpg"
    followers: 2
    rooms    : 0
    visitors : 2
    info     : "Thomas Amundsen decided to don't upload any info"
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
    free_storage : "1 hour"
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