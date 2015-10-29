send_message = require 'app/utils/rooms/tape/send_message'
login_popup = require 'app/utils/login_popup'
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
      send_message @tape_id, message
    else
      app.settings.action = 
        type: "message"
        data: 
          room_id: @tape_id
          message: message
          payload: {}

      app.settings.after_login_url = location.pathname
      do login_popup