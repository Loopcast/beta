ButtonWithTimer = require 'app/views/dashboard/button_with_timer'
L       = require '../../api/loopcast/loopcast'
appcast = require '../../controllers/appcast'
notify   = require 'app/controllers/notify'
user     = require 'app/controllers/user'

module.exports = class Record extends ButtonWithTimer
  active_text  : 'STOP REC'
  inactive_text: 'RECORDED'
  type         : "recording"

  on_room_created: (@room_id, @owner_id) =>
      
    super @room_id, @owner_id

    # log "[GoLive] on_room_created"
    return unless @is_room_owner

    if $('.room_recording' ).length > 0
      @set_active true
    
  
  start: ->
    log "[Record] start"

    if not appcast.get 'selected_device'
      notify.info 'Select your input source'
      return

    @wait()

    if appcast.get 'stream:online'
      # if streaming, start recording!
      @start_recording false

    else
      # start streaming then start recording
      log "We should start streaming then start recording"
      appcast.start_stream @owner_id, appcast.get 'selected_device'
      appcast.on 'stream:online', @start_recording



  stop: ->
    log "[Record] stop"

    @wait()

    ref = @

    appcast.stop_recording()
    L.rooms.stop_recording @room_id, ( error, response ) ->

      ref.set_active false

      if not appcast.get( "stream:streaming" )

        appcast.stop_stream()

      if error
        notify.error "Error while stopping recording"

      channel = pusher.subscribe "tape.#{ref.owner_id}"

      unbind_all = ->
        channel.unbind 'upload:finished', on_upload_finish
        channel.unbind 'upload:error', on_upload_error

      on_upload_finish = (file) ->
        notify.info "File Uploaded: #{file}"
        unbind_all()

      on_upload_error = (error) ->
        log '[Record]on_upload_error', error
        notify.info "Upload Error"
        unbind_all()

      channel.bind "upload:finished", on_upload_finish
      channel.bind "upload:error"   , on_upload_error

  start_recording: ( from_external_event = true ) =>

    if from_external_event
      appcast.off 'stream:online', @start_recording

    ref = @

    appcast.start_recording()
    L.rooms.start_recording @room_id, ( error, response ) ->
      if error
        ref.on_error error
        return

      ref.set_active true

  destroy: ->
    if @is_room_owner
      @text.off 'click', @on_button_clicked
