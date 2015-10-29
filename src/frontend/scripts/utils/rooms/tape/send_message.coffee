L           = require 'app/api/loopcast/loopcast'
module.exports = ( tape_id, message, payload = {} ) ->

  if app.settings.touch_device
    document.activeElement.blur()
    
  data = 
    room_id : tape_id
    message : message
    payload : payload

  # log "[Textarea] send_message", data

  L.chat.message data, ( error, response ) ->

    if error

      console.error "sending message: ", error
      return
