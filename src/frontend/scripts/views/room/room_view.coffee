user = require 'app/controllers/user'

module.exports = class RoomView
  constructor: ( @dom ) ->
    view.on 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main
    v = view.get_by_dom( '.profile_theme' )

    if v.is_create_page()
      ref = @
      v.once 'room:created', (data) ->
        @on_room_created data._id, user.owner_id()

    else
      r = document.getElementById 'room_id'
      @on_room_created r.value, user.owner_id()

    view.off 'binded', @on_views_binded

  on_room_created: ( @room_id, @owner_id ) =>