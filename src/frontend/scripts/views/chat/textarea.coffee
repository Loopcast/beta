login_popup = require 'app/utils/login_popup'
L = require '../../api/loopcast/loopcast'
user = require 'app/controllers/user'
ChatView = require 'app/views/room/chat_view'
StringUtils = require 'app/utils/string'

module.exports = class Textarea extends ChatView

  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id
  
  
    @dom.on 'keyup', @on_key_up
    @heart = @dom.parent().find '.ss-heart'

    @heart.on 'click', @like_cliked

    if app.settings.room_to_like
      app.settings.room_to_like = null
      @like_cliked()

    if app.settings.message_to_send
      if user.is_logged()
        @send_message app.settings.message_to_send
      app.settings.message_to_send = null


  like_cliked: =>
    if user.is_logged()
      @send_message "Liked this song", {like: true}
      @heart.addClass 'liked'
    else
      app.settings.room_to_like = true
      app.settings.after_login_url = location.pathname
      do login_popup    

  on_key_up: ( e ) =>
    return if e.keyCode isnt 13
    # when pressing enter
    # grabs the message

    message = StringUtils.trim @dom.val()

    # clear the field
    @dom.val ""


    if user.is_logged()
      @send_message message
    else
      app.settings.message_to_send = message
      app.settings.after_login_url = location.pathname
      do login_popup


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