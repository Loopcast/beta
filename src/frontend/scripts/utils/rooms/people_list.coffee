module.exports = class PeopleList 
  list: {}

  constructor: ->

  add: ( data ) ->
    if @list[ data.socket_id ]?
      log "[PeopleList] already present", data, data.socket_id, data.name
      return false
    
    log "[PeopleList] add", data, data.socket_id, data.name
    @list[ data.socket_id ] = true
    return true

  remove: ( data ) ->
  


