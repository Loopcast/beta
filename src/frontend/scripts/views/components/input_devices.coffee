appcast  = require 'app/controllers/appcast'
happens = require 'happens'

module.exports = ( dom ) ->

  happens @

  dom.on 'change', ->

    appcast.set 'input_device', dom.val()

  appcast.on 'input_devices', ( devices ) ->

    # clear options
    # TODO: keep the choosen option selected
    # TODO: let the user know if previouly selected isn't available anymore
    dom.html " "
    for device in devices
      dom.append "<option value='#{device}'>#{device}</option>"