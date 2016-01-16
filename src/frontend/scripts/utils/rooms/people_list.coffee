happens = require 'happens'
module.exports = class PeopleList 
  list: {}
  ids: {}
  total: 0

  constructor: ->
    @list = {}
    @ids = {}
    # log "[PeopleList] constructor", @list, @ids
    happens @
    window.people_list = @


  add: ( data ) ->
    
    user = data.user


    log "[PeopleList] ######## ADD", data, user, user.socket_id, user.name, @list

    if @ids[ user.id ]? or not user.socket_id?
      log "[PeopleList] ######## ADD (already present)", user, user.socket_id, user.name, @list, @ids
      log "[PeopleList] motivazione", user.id, @ids[ user.id ]?, (not user.socket_id?)
      log "[PeopleList] #####################"

      return false
    
    @total++

    # log "[PeopleList] ######## ADD (new)", user, user.socket_id, user.name, @list
    @list[ user.socket_id ] = user

    if user.id?
      @ids[ user.id ] = user.socket_id

    # log "[PeopleList] checking the item (after)", @list[ user.socket_id ], "total", @total
    # log "[PeopleList] #####################"

    @emit 'listener:added', 
      item: user
      total: @total

    return true

  remove: ( data ) ->
    socket_id = data.user.socket_id
    log "[PeopleList] ########## THE REMOVE", data, socket_id, @list

    if @list[ socket_id ]?
      @total--
      # log "[PeopleList] ############ REMOVE", socket_id, @list[ socket_id ], "total", @total
      obj = @list[ socket_id ]
      @list[ socket_id ] = null
      delete @list[ socket_id ]
      @remove_id_by_socket_id socket_id


      # log "[PeopleList] #####################"

      @emit 'listener:removed', 
        item: obj
        total: @total

      return true

    # log "[PeopleList] ############ REMOVE (not found)", socket_id, @list[ socket_id ]
    # log "[PeopleList] #####################"

    return false

  remove_id_by_socket_id: ( socket_id ) ->
    for i, item of @ids
      if item is socket_id
        @ids[ i ] = null
        delete @ids[ i ]

  destroy: ->
    @list = {}
    @ids = {}
    delete @list
    delete @ids
    @total = 0

      


