###
# validates user credentials then
# create a new room
###

module.exports =
  method : 'GET'
  path   : '/api/v1/genres/all'

  handler: ( request, reply )->

    reply [
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