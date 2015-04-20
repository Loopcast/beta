Room = schema 'room'

###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

page_limit = 50

module.exports = ( page = 0, tags, callback ) ->

  data = aware {}
  # called once all data is fetched
  respond = ->
    callback null,
      genres: data.get 'genres'
      rooms : data.get 'rooms'

  # ~ base query for genres and finding rooms
  query = $or: [ 
    { 'status.is_live': true }
    { 'status.is_public': true }
  ]


  # ~ fetch genres
  Room.find( query ).distinct( "info.genres" ).lean().exec ( error, genres ) ->

    if error then return callback error

    data.set 'genres', genres

    if data.get( "rooms" ) then respond()

  # ~ fetch rooms

  fields  = null
  options = 
    sort : 
      'is_live': 1
      '_id': -1
    
    limit: page_limit
    skip : page_limit * page

  if tags and tags.length
    query['info.genres'] = $in: tags

  Room.find( query, fields, options ).lean().exec ( error, response ) ->

    if error then return callback error

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