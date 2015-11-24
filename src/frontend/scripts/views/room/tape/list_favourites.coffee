get_coords  = require 'app/utils/io/get_coords' 

module.exports = class ListFavourites
  constructor: (@dom) ->
    view.on 'binded', @_on_views_binded


  _on_views_binded : (scope) =>
    return if not scope.main
    view.off 'binded', @_on_views_binded
    @popup = view.get_by_dom '.chat_user_popup'

    log "[ListFavourites]", @popup

    @dom.on 'mouseover', '.chat_user_thumb', @_on_people_over
    @dom.on 'mouseout', '.chat_user_thumb', @_on_people_out

  _on_people_over: (e) =>
    coords = get_coords e
    id = $(e.currentTarget).data 'user-id'

    log "[ListFavourites] id", id
    @popup.show id, coords

  _on_people_out: =>
    @popup.hide()


  destroy: ->
    @popup = null
    @dom.on 'mouseover', @_on_people_over
    @dom.on 'mouseout', @_on_people_out