###
Wrapper class for jStorage
https://github.com/andris9/jStorage
###

Session = {}

Session.set = ( key, value ) ->
  $.jStorage.set key, value

Session.get = (key, _default = false) ->
  $.jStorage.get key, _default

Session.delete = (key) ->
  $.jStorage.deleteKey key


module.exports = Session