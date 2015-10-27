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
    if not data.get "tapes"  then return
    if not data.get "genres" then return

    callback null,
      genres: data.get 'genres'
      rooms : data.get 'rooms'
      tapes : data.get 'tapes'

  # ~ base query for genres and finding rooms
  # query = $or: [ 
  #   { 'status.is_live'  : true }
  #   { 'status.is_public': true }
  # ]

  # only fetch live rooms
  query = 
    'status.is_live': true

  if search
    query.$text = $search: search
  
  # ~ fetch genres
  find( 'rooms/genres' ) query, 'info.genres', ( error, genres ) ->

    if error then return callback error

    data.set 'genres', genres.sort()

    respond()

  # ~ fetch rooms
  fields  = 
    user  : 1
    info  : 1
    status: 1
    likes : 1

  options = 
    sort :
      'status.live.started_at': -1
      
    limit: page_limit
    skip : page_limit * page

  if genres and genres.length
    query['info.genres'] = $in: genres

  find( 'rooms' ) query, fields, options, ( error, rooms ) ->

    if error then return callback error

    data.set 'rooms', rooms

    respond()


  # ~ fetch tapes

  query = 
    public : true
    deleted: false

  if search
    query.$text = $search: search

  fields  = 
    user       : 1 
    slug       : 1 
    title      : 1 
    genres     : 1 
    location   : 1 
    cover_url  : 1
    likes      : 1 
    plays      : 1 
    s3         : 1 
    started_at : 1 
    stopped_at : 1
    duration   : 1

  options = 
    sort : started_at: -1
    limit: page_limit
    skip : page_limit * page

  if genres and genres.length
    query['genres'] = $in: genres

  find( 'tapes' ) query, fields, options, ( error, tapes ) ->

    if error then return callback error

    data.set 'tapes', tapes

    respond()