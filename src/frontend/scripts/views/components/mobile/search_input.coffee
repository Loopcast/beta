navigation = require 'app/controllers/navigation'
Search = require 'app/views/components/search_input'

module.exports = class SearchInput extends Search
  constructor: ( @dom ) ->
    @dom.on 'click', @on_clicked
    super @dom

  on_clicked: (e) =>
    e.preventDefault()
    e.stopPropagation()

  go_search: ( str ) ->

    navigation.emit 'dropdown:request_close'

    super str

  destroy: ->
    @dom.off 'click', @on_clicked
    super()