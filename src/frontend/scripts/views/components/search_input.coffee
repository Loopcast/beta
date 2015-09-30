navigation = require 'app/controllers/navigation'

module.exports = class SearchInput
  constructor: ( @dom ) ->
    @dom.on 'keypress', @on_keypress

  on_keypress: ( e ) =>
    if e.keyCode is 13
      str = @dom.val()

      if str.length > 0

        type = if location.href.indexOf( 'people' ) > 0 then 'people' else 'sets'


        @go_search str, type


      return false

  go_search: ( str, type = "sets" ) ->

    switch type
      when 'sets'
        navigation.go '/explore?search=' + str
      when 'people'
        navigation.go '/explore/people?search=' + str


  destroy: ->
    @dom.off 'keypress', @on_keypress