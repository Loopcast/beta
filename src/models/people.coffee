###
# Returns an array of People ready to be rendered by
# people.jade template
###

transform = lib 'shared/transform'

module.exports = ( callback ) ->

page_limit = 50

module.exports = ( page = 0, tags, search, callback ) ->

  data = aware {}
  # called once all data is fetched
  respond = ->
    if not data.get "people"  then return
    if not data.get "genres" then return

    callback null,
      genres : data.get 'genres'
      people : data.get 'people'

  # ~ base query for genres and finding rooms
  # query = {}

  # if search
  #   query.$text = $search: search
  
  # ~ fetch genres
  # find( 'profiles/genres' ) query, 'info.genres', ( error, genres ) ->

  #   if error then return callback error

  #   data.set 'genres', genres

  #   respond()

  # ~ fetch people
  # fields  = null
  # options = 
  #   sort : 
  #     'is_live': 1
  #     '_id': -1
    
  #   limit: page_limit
  #   skip : page_limit * page

  # if tags and tags.length
  #   query['info.genres'] = $in: tags

  # find( 'people/people' ) query, fields, options, ( error, rooms ) ->

  #   if error then return callback error

  #   data.set 'rooms', rooms

  #   respond()

  intercom.getUsers
    page    : (page + 1),
    per_page: page_limit
  , ( error, people ) ->
    if error then return callback error

    people = people.users

    profiles = []
    genres   = []

    for item in people
      profile =
        id         : item.user_id

        # top bar info
        name       : item.name
        occupation : item.custom_attributes.occupation
        genres     : item.custom_attributes.genres?.split ','

        # left bar info
        about     : item.custom_attributes.about
        location  : item.custom_attributes.location
        social    : item.custom_attributes.social?.split ','

        avatar    : item.custom_attributes.avatar
        cover     : item.custom_attributes.cover
        images    : transform.all item.custom_attributes.avatar

        followers : item.custom_attributes.followers || 0
        streams   : item.custom_attributes.streams   || 0
        listeners : item.custom_attributes.listeners || 0

      if not profile.genres   then profile.genres   = []
      if not profile.social   then profile.social   = []
      if not profile.recorded then profile.recorded = []
      if not profile.cover    then profile.cover = '/images/homepage_2.jpg'

      genres = genres.concat profile.genres

      profiles.push profile

    data.set 'genres', genres.sort()
    data.set 'people', profiles

    respond()