appcast  = require 'app/controllers/appcast'
happens = require 'happens'
user_controller = require 'app/controllers/user'

Select = require '../components/select'

module.exports = class InputDevices extends Select

  current_device : ""
  devices: []
  first_time: on
  constructor: ( dom ) ->

    super dom

    # refresh devices when clicking
    dom.mouseenter -> appcast.get_devices()

    # appcast.on 'selected_device', ( device ) ->
    #   $( "select option[value='#{device}']" ).prop( 'selected', true ).change()

    ref = @

    
    appcast.on 'input_devices', ( devices ) ->

      log "[InputDevices] on input devices", devices
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

      if ref.first_time
        ref.first_time = off

        d = user_controller.get_preferred_input()
        log "[InputDevices] get_preferred_input", d

        if d
          ref._set_value d





    @on 'changed', ( device ) =>
      log "[device] changed", device, @current_device
      return if device is @current_device
      app.emit 'appcast:input_device', device
      @current_device = device
      
      if device.length > 0
        appcast.select_device dom.find( "select" ).val()

  is_active: ->
    return @current_device.length > 0