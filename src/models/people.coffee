###
# Returns an array of Rooms ready to be rendered by
# rooms.jade template
###

page_limit = 250

module.exports = ( page = 0, genres, search, callback ) ->

  data = aware {}
  # called once all data is fetched
  respond = ->
    if not data.get "users" then return
    if not data.get "genres" then return

    callback null,
      genres : data.get 'genres'
      users  : data.get 'users'

  # ~ base query for genres and finding users
  query = {}

  if search
    query.$text = $search: search
  
  # ~ fetch genres
  find( 'users/genres' ) query, 'info.genres', ( error, genres ) ->

    if error then return callback error

    data.set 'genres', genres.sort()

    respond()

  # ~ fetch users
  fields  = null
  options = 
    sort : 
      'info.occupation': -1
    #   '_id': -1
    
    limit: page_limit
    skip : page_limit * page

  if genres and genres.length
    query['info.genres'] = $in: genres

  find( 'users' ) query, fields, options, ( error, users ) ->

    if error then return callback error

    data.set 'users', users

    respond()