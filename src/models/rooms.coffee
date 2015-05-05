###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

transform = lib 'shared/transform'

page_limit = 50

module.exports = ( page = 0, tags, search, callback ) ->

  data = aware {}
  # called once all data is fetched
  respond = ->
    if not data.get "rooms"  then return
    if not data.get "genres" then return

    callback null,
      genres: data.get 'genres'
      rooms : data.get 'rooms'

  # ~ base query for genres and finding rooms
  query = $or: [ 
    { 'status.is_live': true }
    { 'status.is_public': true }
  ]

  if search
    query.$text = $search: search
  
  # ~ fetch genres
  find( 'rooms/genres' ) query, 'info.genres', ( error, genres ) ->

    if error then return callback error

    data.set 'genres', genres.sort()

    respond()

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

  find( 'rooms/rooms' ) query, fields, options, ( error, rooms ) ->

    if error then return callback error

    for room in rooms
      room.info.images = transform.all_cover room.info.cover_url
      # room.info.images = 
      #   explore_thumb : transform.explore_thumb room.info.cover_url, true
      #   cover : transform.cover room.info.cover_url, true

    data.set 'rooms', rooms

    respond()