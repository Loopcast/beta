Room = schema 'room'

###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

module.exports = ( callback ) ->

  # called once all data is fetched

  respond = ->
    callback null,
      genres: data.get 'genres'
      rooms : data.get 'rooms'

  query = $or: [ 
    { 'status.is_live': true }
    { 'status.is_public': true }
  ]

  fields  = null
  options = 
    sort : 'is_live': 1
    limit: 50
    skip : 0

  data = aware {}

  # fetch rooms
  Room.find( query, fields, options ).lean().exec ( error, response ) ->

    if error then return failed request, reply, error

    rooms = []

    for room in response
      rooms.push
        title    : room.info.title
        author   : room.info.user
        genres   : room.info.genres
        thumb    : "/images/room_thumb.png"
        location : room.info.location
        url      : "/#{room.info.user}/#{room.info.slug}"

    data.set 'rooms', rooms

    if data.get( "genres" ) then respond()

  # fetch genres
  Room.find( query ).distinct( "info.genres" ).lean().exec ( error, genres ) ->

    if error then return failed request, reply, error

    data.set 'genres', genres

    if data.get( "rooms" ) then respond()