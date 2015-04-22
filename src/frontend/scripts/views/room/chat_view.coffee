RoomView = require 'app/views/room/room_view'

module.exports = class ChatView extends RoomView
  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @room.on 'listener:added', @on_listener_added
    @room.on 'listener:removed', @on_listener_removed
    @room.on 'message', @on_message

  on_listener_added: ( listener ) =>

  on_listener_removed: ( listener ) =>

  on_message: ( message ) =>

  destroy: ->
    if @room_created and @room? and @room.off?
      @room.off 'listener:added', @on_listener_added
      @room.off 'listener:removed', @on_listener_removed
      @room.off 'message', @on_message