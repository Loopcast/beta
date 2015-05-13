###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

page_limit = 50

module.exports = ( page = 0, genres, search, callback ) ->

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
    { 'status.is_live'  : true }
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
      'status.is_live': 1
      '_id': -1
    
    limit: page_limit
    skip : page_limit * page

  if genres and genres.length
    query['info.genres'] = $in: genres

  find( 'rooms' ) query, fields, options, ( error, rooms ) ->

    if error then return callback error

    data.set 'rooms', rooms

    respond()