###
# Returns an array of People ready to be rendered by
# people.jade template
###

module.exports = ( callback ) ->


  callback null,
    genres: [
      "House",
      "Tech House",
      "Electro House",
      "Ambient",
      "Alternative",
      "Experimental"
    ]
    
    people: [
        id       : 'thomas-amundsen'
        author   : "Thomas Amundsen"
        kind     : "Dj/Producer"
        genres   : [ "House", "Tech House", "Electro House" ]
        location : "London/UK"
        followers: 45
        url      : "/thomas"
        thumb    : "/images/room_thumb.png"
        following: false
      ,
        id       : 'hems'
        author   : "hems"
        kind     : "Dj/Producer"
        genres  : [ "House", "Ambient", "Alternative", "Experimental" ]
        location : "London/UK"
        followers: 45
        url      : "/hems"
        thumb    : "/images/room_thumb.png"
        following: true
      ]