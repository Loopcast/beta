###
# Returns an array of People ready to be rendered by
# people.jade template
###

module.exports = ( callback ) ->


  callback null,
    genres: [
      "Deep House"
      "Disco"
      "Drum'n Bass"
      "Techno"
    ]
    people: [
        id       : 'thomas-amundsen'
        author   : "Thomas Amundsen"
        kind     : "Dj/Producer"
        genres   : [ "House", "Tech House", "Electro House" ]
        location : "London/UK"
        followers: 45
        url      : "/thomas"
      ,
        id       : 'hems'
        author   : "hems"
        kind     : "Dj/Producer"
        genres  : [ "Ambient", "Alternative", "Experimental" ]
        location : "London/UK"
        followers: 45
        url      : "/hems"
      ]