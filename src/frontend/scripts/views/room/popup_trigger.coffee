get_coords  = require 'app/utils/io/get_coords' 
module.exports = class PopupTrigger 

  constructor: (@dom) ->
    view.on 'binded', @_on_views_binded
    @id = @dom.data 'user-id'


  _on_views_binded : (scope) =>
    return if not scope.main
    view.off 'binded', @_on_views_binded
    @popup = view.get_by_dom '.chat_user_popup'


    @dom.on 'mouseover', @_on_people_over
    @dom.on 'mouseout', @_on_people_out

  _on_people_over: (e) =>
    coords = get_coords e
    @popup.show @id, coords

  _on_people_out: =>
    @popup.hide()


  destroy: ->
    @popup = null
    @dom.on 'mouseover', @_on_people_over
    @dom.on 'mouseout', @_on_people_out