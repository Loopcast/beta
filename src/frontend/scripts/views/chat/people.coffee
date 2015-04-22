transform = require 'shared/transform'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'

module.exports = class People extends RoomView

  listeners: []

  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @counter = @dom.find '.number'
    @listeners_wrapper = @dom.find '.users'

    log "[People] on_room_created", @room_id, @owner_id, user.data

    # Adding the user himself
    @on_listener_added
      name: user.data.name
      url: "/" + user.data.username
      image: user.data.images.chat_sidebar



  on_listener_added: ( listener ) =>
    log "[People] on_listener_added", listener
    @listeners.push listener
    tmpl = require 'templates/chat/chat_listener'

    @listeners_wrapper.append tmpl( listener )
    @update_counter()

  on_listener_removed: ( listener ) =>
    log "[People] on_listener_removed", listener
    @update_counter()

  update_counter: ->
    @counter.html "(#{@listeners.length})"


