ButtonWithTimer = require 'app/views/dashboard/button_with_timer'
L       = require '../../api/loopcast/loopcast'
appcast = require '../../controllers/appcast'
notify   = require 'app/controllers/notify'
user     = require 'app/controllers/user'

module.exports = class Record extends ButtonWithTimer
  active_text  : 'STOP REC'
  inactive_text: 'RECORD'
  type         : "recording"
  tape_id      : null

  on_room_created: (@room_id, @owner_id) =>
      
    super @room_id, @owner_id

    # log "[GoLive] on_room_created"
    return unless @is_room_owner

    if $('.room_recording' ).length > 0
      @set_enabled true
      @set_active  true

      appcast.set( "stream:recording", true )
      appcast.set( "stream:streaming", true )
  
  check_room_status: ->
    @set_active @room.current_status.room.status.is_recording
  
  start: ->
    # log "[Record] start"

    if not appcast.get 'selected_device'
      notify.info 'Select your input source'
      return

    @wait()

    if appcast.get 'stream:online'

      # if streaming, start recording!
      @start_recording false

    else

      # start streaming then start recording
      # log "We should start streaming then start recording"
      appcast.start_stream @owner_id, appcast.get 'selected_device'
      appcast.on 'stream:online', @start_recording



  stop: ->
    # log "[Record] stop"

    @wait()

    ref = @

    appcast.stop_recording()
    L.rooms.stop_recording @room_id, ( error, response ) ->

      # console.log "GOT TAPE ID: #{response.room.recording}"
      log "[Record Button] GOT TAPE ID", response, response.room.recording

      ref.tape_id = response.room.recording

      ref.set_active false

      if not appcast.get( "stream:streaming" )

        appcast.stop_stream()

      if error
        notify.error "Error while stopping recording"

        window._gaq.push(['_trackEvent', 'AppCast Stop Recording', 'Failed', '']);

        return

      window._gaq.push(['_trackEvent', 'AppCast Stop Recording', 'Successful', '']);
      
      channel = pusher.subscribe "tape.#{ref.owner_id}"

      unbind_all = ->
        channel.unbind 'upload:finished', on_upload_finish
        channel.unbind 'upload:error', on_upload_error

      on_upload_finish = (file) ->
        notify.info "File Uploaded: #{file}"
        unbind_all()

      on_upload_error = (error) ->
        # log '[Record]on_upload_error', error
        notify.info "Upload Error"
        unbind_all()

      channel.bind "upload:finished", on_upload_finish
      channel.bind "upload:error"   , on_upload_error

  start_recording: ( from_external_event = true ) =>

    if from_external_event
      appcast.off 'stream:online', @start_recording

    ref = @

    # username  = $( '#owner_username' ).val()
    # room_slug = $( '#room_slug' ).val()
      
    appcast.start_recording()
    L.rooms.start_recording @room_id, ( error, response ) ->
      
      if error
        ref.on_error error

        window._gaq.push(['_trackEvent', 'AppCast Start Recording', 'Failed', '']);

        return

      ref.set_active true

      window._gaq.push(['_trackEvent', 'AppCast Start Recording', 'Successful', '']);

  destroy: ->
    if @is_room_owner
      @text.off 'click', @on_button_clicked

    super()

  on_room_status_changed: ( data ) =>
    # @set_enabled( data.room.status.is_recording or data.room.status.is_live )
    @set_active data.room.status.is_recording
    log "[ButtonWithTimer RECORD] on_room_status_changed", data
