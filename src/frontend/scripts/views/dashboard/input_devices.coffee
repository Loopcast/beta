appcast  = require 'app/controllers/appcast'
happens = require 'happens'
user_controller = require 'app/controllers/user'

Select = require '../components/select'

module.exports = class InputDevices extends Select

  current_device : ""
  devices: []
  first_time: on
  constructor: ( @dom ) ->

    super @dom

    # refresh devices when clicking
    @dom.on 'mouseenter', @on_mouse_enter
    appcast.on 'input_devices', @on_get_input_devices
    @on 'changed', @on_change
    # log "[device] current_device", @current_device
    @first_time = on

  on_mouse_enter: -> 
    appcast.get_devices()

  on_get_input_devices: ( devices ) =>
    # log "[device] on input devices", devices, @first_time
    if @devices.length isnt devices.length
      # TODO: let the user know if previouly selected isn't available anymore

      str = "<option value=''>Select your input device</option>"
      for device in devices
        selected = if @current_device is device then "selected" else ""
        str += "<option value='#{device}' #{selected}>#{device}</option>"

      @dom.find( "select" ).html str

      if @dom.find( "select" ).is(":focus")
        @dom.find( "select" ).blur()

      @devices = devices

    if @first_time
      @first_time = off

      d = user_controller.get_preferred_input()
      # log "[device] get_preferred_input", d

      if d
        @_set_value d

        console.log "CHANGED ->", d
        console.log "CHANGED ->", d
        console.log "CHANGED ->", d
        console.log "CHANGED ->", d
        console.log "CHANGED ->", d

        appcast.set 'selected_d', d


  on_change: ( device ) =>
    # log "[device] changed", device, @current_device
    return if device is @current_device
    # log "[device] emitting event", device
    app.emit 'appcast:input_device', device    
    @current_device = device
    
    if device.length > 0
      appcast.select_device @dom.find( "select" ).val()

  is_active: ->
    return @current_device.length > 0

  destroy: ->
    @first_time = on
    @devices = null
    @current_device = null
    @off? 'changed', @on_change
    @dom.off 'mouseenter', @on_mouse_enter
    appcast.off 'input_devices', @on_get_input_devices

    super()