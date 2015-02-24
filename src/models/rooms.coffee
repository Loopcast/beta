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
      "metal"        : "Metal",
      "rock"         : "Rock",
      "gotic"        : "Gotic",
      "emo"          : "Emo",
      "pop"          : "Pop",
      "rnb"          : "R&B",
      "classic"      : "Classic",
      "hipster"      : "Hipster",
      "progressive"  : "Progressive"
      
    rooms: [
        title   : "Live at EGG London with Brine7Q"
        author  : "Thomas Amundsen"
        thumb   : "/images/room_thumb.png"
        genres  : [ "house", "tech-house", "electro-house" ]
        location: "London/UK"
        url     : "/thomas/live-at-egg-london-with-brine7q"
      ,
        title   : "crazylicious"
        author  : "hems"
        thumb   : "/images/room_thumb.png"
        genres  : [ "ambient", "alternative", "experimental" ]
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
        genres  : [ "punk", "metal", "rock", "gotic", "emo" ]
        location: "Salisbury/UK"
        url     : "/dpr/fuck-that-shit"
      ,
        title   : "Live from Dublin"
        author  : "Scott Hamilton"
        thumb   : "/images/room_thumb.png"
        genres  : [ "pop", "rnb" ]
        location: "Dublin/UK"
        url     : "/scott/dublin"
      ,
        title   : "Testing my new machine"
        author  : "Nicola Antonazzo"
        thumb   : "/images/room_thumb.png"
        genres  : [ "pop", "rnb" ]
        location: "Bergamo/IT"
        url     : "/antonazzo/test"
      ,
        title   : "Le jeux sont fan"
        author  : "Franz Duregne"
        thumb   : "/images/room_thumb.png"
        genres  : [ "classic", "hipster", "progressive" ]
        location: "Paris/FR"
        url     : "/franz/jeux"
      ]
