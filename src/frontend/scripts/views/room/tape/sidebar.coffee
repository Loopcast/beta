tmpl = require 'templates/rooms/tapes/sidebar_favorite'

module.exports = class Sidebar
  people: {}
  constructor: ( @dom ) ->
    view.on 'binded', @on_views_binded
    @list = @dom.find '.list_likes'
    @counter = @dom.find 'h3 .number'

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded
    @tape_view = view.get_by_dom 'div.tape_view'
    @tape_view.on 'like', @on_like_unlike
    @tape_view.on 'unlike', @on_like_unlike
    @like_button = view.get_by_dom '.no_favourites .like_counter'
    log "[Like Button] ---->", @like_button

  on_like_unlike: (data) =>
    log "[Sidebar] on like/unlike", data.counter_likes, data

    if data.type is 'like'
      @on_like data
    else 
      @on_unlike data

    if data.counter_likes > 0
      @dom.addClass 'favourited'
    else
      @dom.removeClass 'favourited'
      @like_button._unlike()

    @counter.html data.counter_likes

  on_like: ( data ) ->
    el = @dom.find( '[data-username='+data.username+']' )
    if el.length <= 0
      @list.append tmpl( data )

    log "---> like", data, el.length

  on_unlike: ( data ) ->
    el = @dom.find( '[data-username='+data.username+']' )
    if el.length > 0
      el.remove()
    log "---> unlike", data, el.length




  destroy: ->
    @tape_view?.off 'like', @on_like_unlike
    @tape_view?.off 'unlike', @on_like_unlike
    @tape_view = null