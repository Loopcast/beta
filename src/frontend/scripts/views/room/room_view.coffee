user = require 'app/controllers/user'

module.exports = class RoomView
  room_created: false
  room_subscribe_id: String
  constructor: ( @dom ) ->
    view.on 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main
    @room = view.get_by_dom( '.profile_theme' )

    if @room.is_create_page()
      ref = @
      @room.once 'room:created', (data) ->
        @on_room_created data._id, user.owner_id()

    else
      r = document.getElementById 'room_id'
      @on_room_created r.value, user.owner_id()

    view.off 'binded', @on_views_binded

  on_room_created: ( @room_id, @owner_id ) =>
    @room_created = true
    @room.on 'listener:added', @on_listener_added
    @room.on 'listener:removed', @on_listener_removed
    @room.on 'message', @on_message


  on_listener_added: ( listener ) =>

  on_listener_removed: ( listener ) =>

  on_message: ( message ) =>

  destroy: ->
    if @room_created
      @room.off 'listener:added', @on_listener_added
      @room.off 'listener:removed', @on_listener_removed
      @room.off 'message', @on_message
