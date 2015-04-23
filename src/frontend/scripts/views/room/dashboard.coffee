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

    if @owner_id isnt user.data.username
      @dom.find( '.centered' ).remove()
      return

    @balloons = 
      appcast: view.get_by_dom @dom.find( '#appcast_not_running_balloon' )
      go_live: view.get_by_dom @dom.find( '#go_live_balloon' )
      record: view.get_by_dom @dom.find( '#record_balloon' )

    log "[Dashboard] balloons", @balloons

    broadcast_trigger = view.get_by_dom @dom.find( '.broadcast_controls' )
    recording_trigger = view.get_by_dom @dom.find( '.recording_controls' )

    if broadcast_trigger.length > 0 
      broadcast_trigger.on 'change', on_broadcast_click

    @volume.left = view.get_by_dom @dom.find( '.meter_wrapper.left' )
    @volume.right = view.get_by_dom @dom.find( '.meter_wrapper.right' )

    # Example of how to use the volume object
    @volume.left.set_volume 0.7
    @volume.right.set_volume 0.78

    input_select = view.get_by_dom @dom.find( '.input_select' )
    input_select.on 'changed', (data) ->
      log "[Dashboard] input changed", data

    appcast.on 'connected', ( is_connected ) =>
      if is_connected
        @on_appcast_running()
      else
        @on_appcast_not_running()

  on_appcast_running: =>
    log "[Dashboard] on_appcast_running"
    @dom.addClass( 'appcast_running' ).removeClass( 'appcast_not_running' )

  on_appcast_not_running: =>
    log "[Dashboard] on_appcast_not_running"
    @dom.removeClass( 'appcast_running' ).addClass( 'appcast_not_running' )

    @balloons.appcast.show()

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
    for item of @balloons
      view.destroy_view @balloons[ item ]