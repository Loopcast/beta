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
      @set_active true
      appcast.set "stream:streaming", true

  start: ->
    log "[GoLive] Clicked start"
    
    if not appcast.get 'selected_device'
      notify.info 'Select your input source'
      return

    @wait()

    appcast.start_stream @owner_id, appcast.get 'selected_device'
    
    # need to be called here otherwise recording will stop
    # streaming when you stop recording
    appcast.set "stream:streaming", true

    appcast.on 'stream:online', @waiting_stream

  stop: ->

    # log "[GoLive] Clicked stop"

    # if not appcast.get 'stream:online'

    #   notify.info '- cant stop stream if not streaming'

    #   return

    @wait()

    appcast.stop_stream()

    ref = @

    if not appcast.get( "stream:recording" )

      appcast.stop_stream()
      L.rooms.stop_stream @room_id, ( error, callback ) ->

        if error
          ref.on_error error, 'stop_stream'

          # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
          return

        ref.set_active false


  # listens for appcast streaming status while streaming
  while_streaming : ( status ) ->

    if not status
      str = 'streaming went offline while streaming'

    else
      str = 'streaming went online while streaming'

    notify.info str


  # listens for appcast streaming status when starting the stream
  waiting_stream : ( status ) =>

    # log "[GoLive] waiting_stream"

    if not status then return

    ref = @
    # call the api
    L.rooms.start_stream @room_id, ( error, result ) ->

      if error
        ref.on_error error

        # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
        return

      appcast.off 'stream:online', ref.waiting_stream, 

      # TODO: fix this error being thrown
      # appcast.on while_streaming
      ref.set_active true

  destroy: ->
    appcast.off 'stream:error', @on_error

  