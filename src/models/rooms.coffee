###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

module.exports = ( callback ) ->


  callback null,
    genres:
      "house"        : "House",
      "tech-house"   : "Tech House",
      "electro-house": "Electro House",
      "ambient"      : "Ambient",
      "alternative"  : "Alternative",
      "experimental" : "Experimental",
      "reggae"       : "Reggae",
      "ska"          : "Ska",
      "fusion"       : "Fusion",
      "funky"        : "Funky",
      "punk"         : "Punk",
      "metal"        : "Metal"

    rooms: [
        title   : "Live at EGG London with Brine7Q"
        author  : "Thomas Amundsen"
        thumb   : "/images/room_thumb.png"
        genres  : [ "house", "tech-house", "electro-house", "metal" ]
        location: "London/UK"
        url     : "/thomas/live-at-egg-london-with-brine7q"
      ,
        title   : "crazylicious"
        author  : "hems"
        thumb   : "/images/room_thumb.png"
        genres  : [ "ambient", "alternative", "punk", "experimental", "house" ]
        location: "London/UK"
        url     : "/hems/crazylicious"
      ,
        title   : "My personal idea about techno"
        author  : "Stefano Ortisi"
        thumb   : "/images/room_thumb.png"
        genres  : [ "reggae", "ska", "fusion", "funky" ]
        location: "Siracusa/IT"
        url     : "/stefanoortisi/my-personal"
      ,
        title   : "Live from Salisbury"
        author  : "DPR"
        thumb   : "/images/room_thumb.png"
        genres  : [ "punk", "metal" ]
        location: "Salisbury/UK"
        url     : "/dpr/fuck-that-shit"
      ,
        title   : "Live from Dublin"
        author  : "Scott Hamilton"
        thumb   : "/images/room_thumb.png"
        genres  : [ "ska", "fusion", "tech-house" ]
        location: "Dublin/UK"
        url     : "/scott/dublin"
      ,
        title   : "Testing my new machine"
        author  : "Nicola Antonazzo"
        thumb   : "/images/room_thumb.png"
        genres  : [ "electro-house", "ambient" ]
        location: "Bergamo/IT"
        url     : "/antonazzo/test"
      ,
        title   : "Le jeux sont fan"
        author  : "Franz Duregne"
        thumb   : "/images/room_thumb.png"
        genres  : [ "ambient", "alternative", "reggae" ]
        location: "Paris/FR"
        url     : "/franz/jeux"
      ]
