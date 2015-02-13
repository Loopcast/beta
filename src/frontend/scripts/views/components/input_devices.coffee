socket  = require 'app/controllers/socket'
happens = require 'happens'

module.exports = ( dom ) ->

  happens @

  console.log 'input devices dom ->', dom

  socket.on 'input_devices', ( devices ) ->

    console.info 'device changed'

    for device in devices
      console.log 'device ->', device

      dom.append "<option value='#{device}'>#{device}</option>"

    console.log "- dom got devices!", devices
      