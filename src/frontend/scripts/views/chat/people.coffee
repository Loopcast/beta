L = require '../../api/loopcast/loopcast'
transform = require 'shared/transform'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'

module.exports = class People extends RoomView

  listeners: []

  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @tmpl = require 'templates/chat/chat_listener'

    @counter = @dom.find '.number'
    @listeners_wrapper = @dom.find '.users'

    log "[People] on_room_created", @room_id, @owner_id, user.data

    # Adding the user himself
    @send_message "added"

    # @on_listener_added
    #   name: user.data.name
    #   url: "/" + user.data.username
    #   image: user.data.images.chat_sidebar

  send_message: ( method ) ->
    data = 
      method: method
      room_id: @room_id
      owner_id: @owner_id

    log "[People] send_message", data

    L.chat.listener data, ( error, response ) ->

      if error

        console.error "sending message: ", error
        return

      console.log "got response", response



  on_listener_added: ( listener ) =>
    log "[People] on_listener_added", listener

    @listeners.push listener
    @listeners_wrapper.append @tmpl( listener )
    @update_counter()

  on_listener_removed: ( listener ) =>
    log "[People] on_listener_removed", listener

    @listeners_wrapper.find( '#listener_' + listener.id ).remove()

    i = 0
    for item in @listeners
      if item.id is listener.id
        break
      i++

    log "[People] removing index", i
    @listeners.splice i, 1


    @update_counter()

  update_counter: ->
    @counter.html "(#{@listeners.length})"

  destroy: ->
    @send_message "removed"
    super()


