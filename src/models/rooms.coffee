###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

module.exports = ( callback ) ->


  callback null,
    genres: [
      "House",
      "Tech House",
      "Electro House",
      "Ambient",
      "Alternative",
      "Experimental",
      "Reggae",
      "Ska",
      "Fusion",
      "Funky",
      "Punk",
      "Metal"
    ]

    rooms: [
        title   : "Live at EGG London with Brine7Q"
        author  : "Thomas Amundsen"
        thumb   : "/images/room_thumb.png"
        genres  : [ "House", "Tech House", "Electro House", "Metal" ]
        location: "London/UK"
        url     : "/thomas/live-at-egg-london-with-brine7q"
      ,
        title   : "crazylicious"
        author  : "hems"
        thumb   : "/images/room_thumb.png"
        genres  : [ "Ambient", "Alternative", "Punk", "Experimental", "House" ]
        location: "London/UK"
        url     : "/hems/crazylicious"
      ,
        title   : "My personal idea about techno"
        author  : "Stefano Ortisi"
        thumb   : "/images/room_thumb.png"
        genres  : [ "Reggae", "Ska", "Fusion", "Funky" ]
        location: "Siracusa/IT"
        url     : "/stefanoortisi/my-personal"
      ,
        title   : "Live from Salisbury"
        author  : "DPR"
        thumb   : "/images/room_thumb.png"
        genres  : [ "Punk", "Metal" ]
        location: "Salisbury/UK"
        url     : "/dpr/fuck-that-shit"
      ,
        title   : "Live from Dublin"
        author  : "Scott Hamilton"
        thumb   : "/images/room_thumb.png"
        genres  : [ "Ska", "Fusion", "Tech House" ]
        location: "Dublin/UK"
        url     : "/scott/dublin"
      ,
        title   : "Testing my new machine"
        author  : "Nicola Antonazzo"
        thumb   : "/images/room_thumb.png"
        genres  : [ "Electro House", "Ambient" ]
        location: "Bergamo/IT"
        url     : "/antonazzo/test"
      ,
        title   : "Le jeux sont fan"
        author  : "Franz Duregne"
        thumb   : "/images/room_thumb.png"
        genres  : [ "Ambient", "Alternative", "Reggae" ]
        location: "Paris/FR"
        url     : "/franz/jeux"
      ]
