socket  = require 'app/controllers/socket'
happens = require 'happens'

module.exports = ( dom ) ->

  happens @

  dom.on 'change', ->

    console.log 'setting socket input device ->', dom.val()
    socket.set 'input_device', dom.val()

  socket.on 'input_devices', ( devices ) ->

    for device in devices
      dom.append "<option value='#{device}'>#{device}</option>"