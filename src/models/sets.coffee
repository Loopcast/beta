###
# Returns an array of Sets ready to be rendered by
# sets.jade template
###

module.exports = ( callback ) ->


  callback null,
    genres: [
      "Deep House"
      "Disco"
      "Drum'n Bass"
      "Techno"
    ]
    sets: [
        title    : "Last Saturday Set"
        author   : "Thomas Amundsen"
        kind     : "Dj/Producer"
        genres   : [ "House", "Tech House", "Electro House" ]
        location : "London/UK"
        loves    : 26
        plays    : 273
        url      : "/thomas/last-saturday-set"
      ,
        title    : "Deeeeeeelicious"
        author   : "hems"
        kind     : "Dj/Producer"
        genres  : [ "Ambient", "Alternative", "Experimental" ]
        location : "London/UK"
        loves    : 26
        plays    : 273
        url      : "/hems/deeeeeeelicious"
      ]