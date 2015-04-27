L = require '../../api/loopcast/loopcast'
user = require 'app/controllers/user'
ChatView = require 'app/views/room/chat_view'
StringUtils = require 'app/utils/string'

module.exports = class Textarea extends ChatView

  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id
    
    # log "[Textarea] on_room_created", @room_id
    @check_user()

  check_user: ->
    if user.is_logged()
      @dom.on 'keyup', @on_key_up
      @heart = @dom.parent().find '.ss-heart'

      @heart.on 'click', @like_cliked

  like_cliked: =>
    @send_message "Liked this song", {like: true}
    @heart.addClass 'liked'

  on_key_up: ( e ) =>
    return if e.keyCode isnt 13
    # when pressing enter
    # grabs the message
    message = StringUtils.trim @dom.val()

    # clear the field
    @dom.val ""

    @send_message message


  send_message: ( message, additional_data = {} ) ->
    data = 
      owner_id: @owner_id
      user_id: user.data.username
      room_id: @room_id
      message: message
      additional_data: additional_data

    # log "[Textarea] send_message", data

    L.chat.message data, ( error, response ) ->

      if error

        console.error "sending message: ", error
        return

      # console.log "got response", response

  destroy: ->
    @dom.off 'keyup'