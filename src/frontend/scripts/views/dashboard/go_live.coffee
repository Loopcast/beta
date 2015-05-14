RoomView = require 'app/views/room/room_view'
L        = require '../../api/loopcast/loopcast'
appcast  = require '../../controllers/appcast'
notify   = require 'app/controllers/notify'
happens  = require 'happens'
user     = require 'app/controllers/user'

module.exports = class GoLive extends RoomView
  # TODO: fetch information from backend
  is_live: false

  constructor:  ( @dom ) ->
    happens @
    @text = @dom.find 'a'
    super @dom

  on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    # log "[GoLive] on_room_created"
    return unless @is_room_owner


    appcast.on 'stream:error', @on_error

    @text.on 'click', @on_button_clicked

    if $('.room_live' ).length > 0
      @set_live( true )

  on_button_clicked: =>
    # TODO: make it clever
    return if @waiting

    if not @live
      @go_live()
    else
      @go_offline()

  wait: ->
    # log "[GoLive] wait"
    @waiting = true
    @text.html "..."

  set_live: ( live ) ->
    # log "[GoLive] set_live", live
    @waiting = false
    @live = live
    @emit 'live:changed', @live

    if @live
      @text.html 'GO OFFLINE'
    else
      @text.html 'GO LIVE'

  on_error: ( error, origin = 'stream:error' ) =>
    @waiting = false

    return if not error
    @text.html "ERROR"
    # log "[GoLive] on_error. origin", error, origin

    notify.info error

  go_live: ->
    # log "[GoLive] Clicked go_live"
    if not appcast.get 'input_device'

      notify.info 'Select your input source'

      return

    @wait()

    appcast.start_stream @owner_id, appcast.get 'input_device'

    appcast.on 'stream:online', @waiting_stream

  go_offline: ->

    # log "[GoLive] Clicked go_offline"

    if not appcast.get 'stream:online'

      notify.info '- cant stop stream if not streaming'

      return

    @wait()

    appcast.stop_stream()

    ref = @

    L.rooms.stop_stream @room_id, ( error, callback ) ->

      if error
        ref.on_error error, 'stop_stream'

        # LATER: CHECK IF USER IS OFFLINE AND WAIT FOR CONNECTION?
        return

      ref.set_live false


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

      appcast.off ref.waiting_stream

      # TODO: fix this error being thrown
      # appcast.on while_streaming
      ref.set_live true

  