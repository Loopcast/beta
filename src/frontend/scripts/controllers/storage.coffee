###
Wrapper class for jStorage
https://github.com/andris9/jStorage
###

Session = {}

Session.set = ( key, value ) ->
  # log "[Session] set", key, value
  $.jStorage.set key, value

Session.get = (key, _default = false) ->
  value = $.jStorage.get key, _default
  # log "[Session] get", key, value
  value

Session.delete = (key) ->
  log "[Session] delete", key
  $.jStorage.deleteKey key


module.exports = Session