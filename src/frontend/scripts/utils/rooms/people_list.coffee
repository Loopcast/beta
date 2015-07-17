module.exports = class PeopleList 
  list: {}

  constructor: ->

  add: ( data ) ->
    if @list[ data.socket_id ]?
      log "[PeopleList] already present", data, data.socket_id, data.name
      return false
    
    log "[PeopleList] add", data, data.socket_id, data.name
    @list[ data.socket_id ] = data
    return true

  remove: ( socket_id ) ->
    log "[PeopleList] remove", socket_id, @list
    if @list[ socket_id ]?
      log "[PeopleList] remove", @list[ socket_id ]
      obj = @list[ socket_id ]
      @list[ socket_id ] = null

      return obj

    return false
      


