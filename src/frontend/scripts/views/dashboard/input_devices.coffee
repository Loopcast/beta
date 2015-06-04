appcast  = require 'app/controllers/appcast'
happens = require 'happens'

Select = require '../components/select'

module.exports = class InputDevices extends Select

  constructor: ( dom ) ->

    super dom

    appcast.on 'selected_device', ( device ) ->

      $( "select option[value='#{device}']" ).prop( 'selected', true ).change()

    appcast.on 'input_devices', ( devices ) ->

      # clear options
      # TODO: keep the choosen option selected
      # TODO: let the user know if previouly selected isn't available anymore
      dom.find( "select" ).html " "
      
      for device in devices
        dom.find( "select" ).append "<option value='#{device}'>#{device}</option>"

    @on 'changed', ( device ) ->
      log "[device] changed", device
      appcast.set 'input_device', dom.find( "select" ).val()