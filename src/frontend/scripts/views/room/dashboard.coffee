appcast = require 'app/controllers/appcast'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'
L = require 'api/loopcast/loopcast'

module.exports = class Dashboard extends RoomView
  volume : 
    left : null
    right: null
  balloons: []
  live_button: null
  record_button: null
  publish_modal: null
  appcast_is_running: false
  timeout: null

  on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    unless @is_room_owner
      @dom.find( '.centered' ).remove()
      # log "[Dashboard] on_room_created (it is not owner) returning."
      return

    # log "[Dashboard] on_room_created (it is the owner)"
    
    @publish_modal = view.get_by_dom '#publish_modal'

    

    @live_button   = view.get_by_dom @dom.find( '#go_live_button' )
    @record_button = view.get_by_dom @dom.find( '#record_button' )
    @live_button.on 'changed', @on_live_changed
    @record_button.on 'changed', @on_record_changed
    @share = view.get_by_dom @dom.find( '#share_dashboard' )
    @room_view = view.get_by_dom '.createroom'


    ref = @
    L.rooms.info room_id, (error, response) -> 
      # log "[Dashboard] getting room info", response

      ref.share.update_with_data
        link: "/" + response.room.info.user + "/" + response.room.info.slug
        title: response.room.info.title
        summary: response.room.info.about
        image: response.room.info.cover_url


    @balloons = 
      appcast: view.get_by_dom( '#appcast_not_running_balloon' )
      record: view.get_by_dom( '#record_balloon' )
      live_instructions: view.get_by_dom( '#go_live_instructions' )
      dashboard_help: view.get_by_dom( '#dashboard_help_baloon' )

    @appcast_not_running_message = @dom.find '.appcast_not_running_message'
    @meter = view.get_by_dom @dom.find( '.meter_wrapper' )

    # moved this code to input_devices.coffee
    # @input_select = view.get_by_dom @dom.find( '.input_select' )
    # @input_select.on 'changed', (data) ->
    #   log "[Dashboard] input changed", data
    #   appcast.set 'input_device', data
    #   appcast.select_device data
    # @on_appcast_not_running()
    @on_appcast_connected()
    @appcast_not_running_message.on 'click', @toggle_not_running_balloon
    appcast.on 'connected', @on_appcast_connected
    app.on 'appcast:input_device', @on_device_changed

    @manage_download_button()




    
    


  ###
  Set the right download link of Appcast depending on OS
  ###
  manage_download_button: ->
    download = $ '#download_appcast'

    if app.settings.browser.OS is 'Mac'
      download.attr 'href', ( download.data( 'mac' ) )
    else
      download.attr 'href', ( download.data( 'win' ) )




  ###
  Add a facebook send button to the dashboard after the element #share_dashboard
  ###
  # add_facebook_send_button: (url) ->
  #   @dom.find( '.custom-fb-send' ).on 'click', ->
  #     FB.ui
  #       method: 'send',
  #       name: 'Send your room link to friends'
  #       link: url
    
  #   if window.fb_ready
  #     fb_parse()
  #   else
  #     $(window).on 'fb:ready', fb_parse

  on_device_changed: =>
    # log "[Dashboard] on_device_changed", app.session.get( 'hide:help' )
    @balloons.dashboard_help.hide()
    if not app.session.get( 'hide:help' )
      @balloons.live_instructions.show()

  toggle_not_running_balloon: =>
    @balloons.appcast.toggle()

  on_live_changed: ( data ) =>
    # log "[Room] on_live_changed", data

  on_record_changed: ( data ) =>
    # log "[Room] on_record_changed", data
    # log "-> recording", data
    # log "is offline", $('.room_public').length <= 0

    if not data and $('.room_public').length <= 0
      # log "[Dashboard] publish_modal.open_with_id", @record_button.tape_id
      @publish_modal.open_with_id @record_button.tape_id


  on_appcast_connected: ( is_connected = false ) =>

    # log "[Dashboard] on_appcast_connected", is_connected
    @appcast_is_running = is_connected

    clearTimeout @timeout
    
    @timeout = setTimeout @check_appcast_running, 100

  check_appcast_running: =>
    if @appcast_is_running
      @on_appcast_running()
    else
      @on_appcast_not_running()

  on_appcast_running: =>
    # log "[Dashboard] on_appcast_running"
    @dom.addClass( 'appcast_running' ).removeClass( 'appcast_not_running' )
    @meter.activate()
    @balloons.appcast.hide()
    @balloons.dashboard_help.show()

  on_appcast_not_running: =>
    # log "[Dashboard] on_appcast_not_running"
    @dom.removeClass( 'appcast_running' ).addClass( 'appcast_not_running' )

    @meter.deactivate()
    @balloons.appcast.show()


    if $( '.room_live' ).length > 0
      app.emit 'room:go_offline'


    # delay 4000, => @balloons.appcast.hide()


  destroy: ->

    super()
    
    @publish_modal = null
    @room_view = null
    if @is_room_owner

      for item of @balloons
        view.destroy_view @balloons[ item ]
      if @appcast_not_running_message.length > 0 
        @appcast_not_running_message.off 'click', @toggle_not_running_balloon

      if @live_button
        @live_button.off 'click'
        @record_button.off 'click'

        @live_button.off 'changed', @on_live_changed
        @record_button.off 'changed', @on_record_changed

      appcast.off 'connected', @on_appcast_connected

      app.off 'appcast:input_device', @on_device_changed



