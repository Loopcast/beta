###
# validates user credentials then
# create a new room
###

module.exports =
  method : 'GET'
  path   : '/api/v1/occupations/all'

  handler: ( request, reply )->

    reply [
      "DJ/Producer"
      "Record Label"
      "Agency"
      "Promoter"
      "Club"
      "Festival"
      "Listener"
      "Radio Station"
      "Podcaster"
    ]