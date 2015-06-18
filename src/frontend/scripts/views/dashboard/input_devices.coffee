appcast  = require 'app/controllers/appcast'
happens = require 'happens'

Select = require '../components/select'

module.exports = class InputDevices extends Select

  constructor: ( dom ) ->

    super dom

    # refresh devices when clicking
    dom.mouseenter -> appcast.get_devices()

    appcast.on 'selected_device', ( device ) ->

      
      $( "select option[value='#{device}']" ).prop( 'selected', true ).change()

    appcast.on 'input_devices', ( devices ) ->

      console.log "got devices ->", devices


      # clear options
      # TODO: keep the choosen option selected
      # TODO: let the user know if previouly selected isn't available anymore
      dom.find( "select" ).html " "

      for device in devices
        dom.find( "select" ).append "<option value='#{device}'>#{device}</option>"

      if dom.find( "select" ).is(":focus")
        
        dom.find( "select" ).blur()
        # TODO: find a way of refreshing the list when it's open
        # dom.find( "select" ).focus()

    @on 'changed', ( device ) ->
      log "[device] changed", device

      appcast.select_device dom.find( "select" ).val()