get_coords  = require 'app/utils/io/get_coords' 

module.exports = class ListFavourites
  lock: false
  request: null
  constructor: (@dom) ->
    view.on 'binded', @_on_views_binded


  _on_views_binded : (scope) =>
    return if not scope.main
    view.off 'binded', @_on_views_binded
    @popup = view.get_by_dom '.chat_user_popup'

    log "[ListFavourites]", @popup

    @dom.on 'mousemove', '.chat_user_thumb', @_on_people_over
    @dom.on 'mouseout', '.chat_user_thumb', @_on_people_out

  _on_people_over: (e) =>

    coords = get_coords e
    id = $(e.currentTarget).data 'user-id'

    if @lock
      log "[ddd]lock active, return"
      return 
    
    log "[ddd]show"
    @popup.show id, coords, =>
      log "[ddd]set lock true"
      @lock = true

  _on_people_out: =>
    log "[ddd]hide"
    @popup.hide =>
      log "[ddd]set lock false"
      @lock = false


  destroy: ->
    @popup = null
    @dom.on 'mousemove', @_on_people_over
    @dom.on 'mouseout', @_on_people_out