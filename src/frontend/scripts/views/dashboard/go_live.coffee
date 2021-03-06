ButtonWithTimer = require 'app/views/dashboard/button_with_timer'
L        = require '../../api/loopcast/loopcast'
appcast  = require '../../controllers/appcast'
notify   = require 'app/controllers/notify'
happens  = require 'happens'
user     = require 'app/controllers/user'

module.exports = class GoLive extends ButtonWithTimer

  active_text  : 'GO OFFLINE'
  inactive_text: 'GO LIVE'
  type         : "live"

  on_room_created: (@room_id, @owner_id) =>
      
    super @room_id, @owner_id

    # log "[GoLive] on_room_created"
    return unless @is_room_owner

    appcast.on 'stream:error', @on_error

    # update status based on room live status
    if $('.room_live' ).length > 0
      # log "[DDD] live button set active"
      @set_enabled true
      @set_active true

      appcast.set "stream:streaming", true
      # appcast.set "stream:online", true

  check_room_status: ->
    @set_active @room.current_status.room.status.is_live

  start: ->
    # log "[GoLive] Clicked start"
    
    if not appcast.get 'selected_device'
      notify.info 'Select your input source'
      return

    @wait()

    username  = $( '#owner_username' ).val()
    room_slug = $( '#room_slug' ).val()

    checked = $( "input.notify_checkbox" )[0].checked

    L.rooms.start_stream @room_id, checked, ( error, result ) =>

      if error
        @on_error error

        window._gaq.push(['_trackEvent', 'AppCast Start Streaming', 'Failed', '']);

        # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
        return


      # need to be called here otherwise recording will stop
      # streaming when you stop recording
      appcast.set "stream:streaming", true
        
      # if already recording, don't need to start streaming again!
      if not appcast.get "stream:recording"

        if not result.password
          console.error 'error fetching password in order to stream'
          console.log 'maybe already recording?'
          console.log result

          return

        password  = result.password

        appcast.start_stream username, room_slug, password
        
        appcast.on 'stream:online', ( status ) =>

          return if not status

          appcast.off 'stream:online', @waiting_stream, 

          # TODO: fix this error being thrown
          # appcast.on while_streaming
          @set_active true


          window._gaq.push(['_trackEvent', 'AppCast Start Streaming', 'Successful', '']);

      else

        appcast.off 'stream:online', @waiting_stream, 

        # TODO: fix this error being thrown
        # appcast.on while_streaming
        @set_active true


        window._gaq.push(['_trackEvent', 'AppCast Start Streaming', 'Successful', '']);


  stop: ->

    # log "[GoLive] Clicked stop"

    if not appcast.get 'stream:streaming'

      notify.info '- cant stop stream if not streaming'

      return

    @wait()


    if not appcast.get( "stream:recording" )

      appcast.stop_stream()

    appcast.set( "stream:streaming", false )
    L.rooms.stop_stream @room_id, ( error, callback ) =>

      if error
        @on_error error, 'stop_stream'

        window._gaq.push(['_trackEvent', 'AppCast Stop Streaming', 'Failed', '']);

        # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
        return

      @set_active false

      window._gaq.push(['_trackEvent', 'AppCast Stop Streaming', 'Successful', '']);


  # listens for appcast streaming status while streaming
  while_streaming : ( status ) ->

    if not status
      str = 'streaming went offline while streaming'

    else
      str = 'streaming went online while streaming'

    notify.info str


  on_room_status_changed: ( data ) =>
    # @set_enabled( data.room.status.is_recording or data.room.status.is_live )
    @set_active data.room.status.is_live
    # log "[ButtonWithTimer LIVE] on_room_status_changed", data

  destroy: ->
    appcast.off 'stream:error', @on_error
    super()

  