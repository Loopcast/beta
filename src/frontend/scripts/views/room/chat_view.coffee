RoomView = require 'app/views/room/room_view'

module.exports = class ChatView extends RoomView
  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id
    @room.on 'message', @on_message

  on_listener_added: ( listener ) =>

  on_listener_removed: ( listener ) =>

  on_message: ( message ) =>

  destroy: ->
    super()
    
    if @room_created and @room? and @room.off?
      @room.off 'message', @on_message