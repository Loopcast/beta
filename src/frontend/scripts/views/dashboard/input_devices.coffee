appcast  = require 'app/controllers/appcast'
happens = require 'happens'

Select = require '../components/select'

module.exports = class InputDevices extends Select

  current_device : ""
  devices: []
  constructor: ( dom ) ->

    super dom

    # refresh devices when clicking
    dom.mouseenter -> appcast.get_devices()

    # appcast.on 'selected_device', ( device ) ->
    #   $( "select option[value='#{device}']" ).prop( 'selected', true ).change()

    ref = @
    appcast.on 'input_devices', ( devices ) ->


      if ref.devices.length isnt devices.length
        # TODO: let the user know if previouly selected isn't available anymore

        str = "<option value=''>Select your input device</option>"
        for device in devices
          selected = if ref.current_device is device then "selected" else ""
          # log "[device] - ", device, ref.current_device, selected
          str += "<option value='#{device}' #{selected}>#{device}</option>"

        # log "[device]", str
        dom.find( "select" ).html str

        if dom.find( "select" ).is(":focus")
          
          dom.find( "select" ).blur()
          # TODO: find a way of refreshing the list when it's open
          # dom.find( "select" ).focus()

        ref.devices = devices



    @on 'changed', ( device ) =>
      # log "[device] changed", device, @current_device

      return if device is @current_device
      @current_device = device
      
      if device.length > 0
        appcast.select_device dom.find( "select" ).val()