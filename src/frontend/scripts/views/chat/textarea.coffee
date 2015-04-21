L = require '../../api/loopcast/loopcast'
user = require 'app/controllers/user'
RoomView = require 'app/views/room/room_view'
StringUtils = require 'app/utils/string'

module.exports = class Textarea extends RoomView

  constructor: ( @dom ) ->
    super @dom

  on_room_created: ( @room_id, @owner_id ) =>
    log "[Textarea] on_room_created", @room_id
    @dom.on 'keyup', (e) =>

      return if e.keyCode isnt 13
      # when pressing enter
      # grabs the message
      message = StringUtils.trim @dom.val()

      # clear the field
      @dom.val ""

      data = 
        message: message
        owner_id: @owner_id
        user_id: user.data.username
        room_id: @room_id

      L.chat.message data, ( error, response ) ->

        if error

          console.error "sending message: ", error
          return

        console.log "got response", response

  destroy: ->
    @dom.off 'keyup'