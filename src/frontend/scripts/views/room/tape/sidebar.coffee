module.exports = class Sidebar
  constructor: ( @dom ) ->
    view.on 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded
    @tape_view = view.get_by_dom 'div.tape_view'
    @tape_view.on 'like', @on_like
    @tape_view.on 'unlike', @on_unlike

  on_like: (data) =>
    log "[Sidebar] on like", data
    @dom.addClass 'favourited'

  on_unlike: ( data ) =>
    log "[Sidebar] on unlike", data

  destroy: ->
    @tape_view?.off 'like', @on_like
    @tape_view?.off 'unlike', @on_unlike
    @tape_view = null