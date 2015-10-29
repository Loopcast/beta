StringUtils = require 'app/utils/string'
L           = require 'app/api/loopcast/loopcast'
user        = require 'app/controllers/user'

module.exports = class Textarea
  tape_id: null
  constructor: ( @dom ) ->
    @tape_id       = @dom.data 'tape-id'
    @textarea      = @dom.find '.chat_user_text'
    @submit_button = @dom.find '.post_comment'

    @submit_button.on 'click', @post_comment


  post_comment: =>
    message = StringUtils.trim @textarea.val()

    log "[Textarea] enter_pressed", message
    # clear the field
    @textarea.val ""


    if user.is_logged()
      @send_message message
    else
      app.settings.message_to_send = message
      app.settings.after_login_url = location.pathname
      do login_popup

  send_message: ( message, payload = {} ) ->
    log "[Textarea] send_message", message

    if app.settings.touch_device
      document.activeElement.blur()
      
    data = 
      room_id : @tape_id
      message : message
      payload : payload

    # log "[Textarea] send_message", data

    L.chat.message data, ( error, response ) ->
      log "[Textarea] send_message repsonse", error, response
      if error

        console.error "sending message: ", error
        return