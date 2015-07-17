navigation = require 'app/controllers/navigation'

module.exports = class SearchInput
  constructor: ( @dom ) ->
    @dom.on 'keypress', @on_keypress

  on_keypress: ( e ) =>
    if e.keyCode is 13
      str = @dom.val()
      if str.length > 0
        @go_search str
      return false

  go_search: ( str ) ->
    navigation.go '/explore?search=' + str


  destroy: ->
    @dom.off 'keypress', @on_keypress