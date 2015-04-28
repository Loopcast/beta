appcast = require 'app/controllers/appcast'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'

module.exports = class Dashboard extends RoomView
  volume : 
    left : null
    right: null
  balloons: []

  constructor: ( @dom ) ->
    super @dom


  on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    unless @is_room_owner
      @dom.find( '.centered' ).remove()
      log "[Dashboard] on_room_created (is not owner) returning."
      return

    log "[Dashboard] on_room_created (it'is the owner)"

    @balloons = 
      appcast: view.get_by_dom @dom.find( '#appcast_not_running_balloon' )
      go_live: view.get_by_dom @dom.find( '#go_live_balloon' )
      record: view.get_by_dom @dom.find( '#record_balloon' )

    @appcast_not_running_message = @dom.find '.appcast_not_running_message'
    @meter = view.get_by_dom @dom.find( '.meter_wrapper' )
    @broadcast_trigger = view.get_by_dom @dom.find( '.broadcast_controls' )
    @recording_trigger = view.get_by_dom @dom.find( '.recording_controls' )

    if @broadcast_trigger.length > 0 
      @broadcast_trigger.on 'change', @on_broadcast_click
    
    @input_select = view.get_by_dom @dom.find( '.input_select' )
    @input_select.on 'changed', (data) ->
      log "[Dashboard] input changed", data
      appcast.set 'input_device', data

    @appcast_not_running_message.on 'click', @toggle_not_running_balloon
    appcast.on 'connected', @on_appcast_connected

  toggle_not_running_balloon: =>
    @balloons.appcast.toggle()

  on_appcast_connected: ( is_connected ) =>

    if is_connected
      @on_appcast_running()
    else
      @on_appcast_not_running()

  on_appcast_running: =>
    log "[Dashboard] on_appcast_running"
    @dom.addClass( 'appcast_running' ).removeClass( 'appcast_not_running' )
    @meter.activate()
    @balloons.appcast.hide()

  on_appcast_not_running: =>
    log "[Dashboard] on_appcast_not_running"
    @dom.removeClass( 'appcast_running' ).addClass( 'appcast_not_running' )

    @meter.deactivate()
    @balloons.appcast.show()

    delay 4000, => @balloons.appcast.hide()

  on_broadcast_click : (data) ->
    log "on_broadcast_click", data

    if data is "start"
      # do appcast.start_stream
    else
      # do appcast.stop_stream

  on_recording_click : (data) ->
    log "on_recording_click", data

    if data is "start"
      # do appcast.start_recording
    else
      # do appcast.stop_recording

  destroy: ->
    if @is_room_owner
      for item of @balloons
        view.destroy_view @balloons[ item ]
      if @broadcast_trigger.length > 0 
        @broadcast_trigger.off 'change', @on_broadcast_click
        @appcast_not_running_message.off 'click', @toggle_not_running_balloon

      appcast.off 'connected', @on_appcast_connected



