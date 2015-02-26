###
# Returns an array of People ready to be rendered by
# people.jade template
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
    
    people: [
        id       : 'thomas-amundsen'
        author   : "Thomas Amundsen"
        kind     : "Dj/Producer"
        genres   : [ "house", "tech-house", "electro-house" ]
        location : "London/UK"
        followers: 45
        url      : "/thomas"
        thumb    : "/images/room_thumb.png"
        following: false
      ,
        id       : 'hems'
        author   : "hems"
        kind     : "Dj/Producer"
        genres  : [ "house", "ambient", "alternative", "experimental" ]
        location : "London/UK"
        followers: 45
        url      : "/hems"
        thumb    : "/images/room_thumb.png"
        following: true
      ]