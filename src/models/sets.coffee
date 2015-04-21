###
# Returns an array of Sets ready to be rendered by
# sets.jade template
###

module.exports = ( callback ) ->


  callback null,
    genres:
      "house"        : "House",
      "tech-house"   : "Tech House",
      "electro-house": "Electro House",
      "ambient"      : "Ambient",
      "alternative"  : "Alternative",
      "experimental" : "Experimental"

    sets: [
        title    : "Last Saturday Set"
        author   : "Thomas Amundsen"
        kind     : "Dj/Producer"
        genres   : [ "house", "tech-house", "electro-house" ]
        location : "London/UK"
        loves    : 26
        plays    : 273
        thumb    : "/images/default_room_cover.jpg"
        url      : "/thomas/last-saturday-set"
      ,
        title    : "Deeeeeeelicious"
        author   : "hems"
        kind     : "Dj/Producer"
        genres  : [ "house", "ambient", "alternative", "experimental" ]
        location : "London/UK"
        loves    : 26
        plays    : 273
        thumb    : "/images/default_room_cover.jpg"
        url      : "/hems/deeeeeeelicious"
      ]