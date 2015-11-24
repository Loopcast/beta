L           = require 'app/api/loopcast/loopcast'
module.exports = ( tape_id, message, payload = {} ) ->

  if app.settings.touch_device
    document.activeElement.blur()
    
  data = 
    tape_id : tape_id
    message : message
    payload : payload

  # log "[Textarea] send_message", data

  L.tapes.comment data, ( error, response ) ->

    if error

      console.error "sending message: ", error
      return
