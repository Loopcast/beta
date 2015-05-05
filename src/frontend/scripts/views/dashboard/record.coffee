RoomView = require 'app/views/room/room_view'
L       = require '../../api/loopcast/loopcast'
appcast = require '../../controllers/appcast'
notify   = require 'app/controllers/notify'
happens  = require 'happens'
user     = require 'app/controllers/user'

module.exports = class Record extends RoomView
  # TODO: fetch information from backend
  recording : false
  waiting   : false

  constructor: ( @dom ) ->
    happens @
    @text = @dom.find 'a'
    super @dom

  on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    return unless @is_room_owner

    @text.on 'click', @on_button_clicked



  on_button_clicked: =>
    # TODO: make it clever
    return if @waiting

    if not @recording
      @start()
    else
      @stop()

  on_error: ( error, origin = 'stream:error' ) =>
    @waiting = false

    return if not error
    @text.html "ERROR"
    log "[Record] on_error. origin", error, origin
    error += " - Restart appcast."
    notify.info error

  wait: ->
    log "[Record] wait"
    @waiting = true
    @text.html "..."

  set_recording: ( recording ) ->

    log "[Record] set_recording", recording
    @waiting = false
    @recording = recording
    @emit 'record:changed', @recording

    if @recording
      @text.html 'STOP REC'
    else
      @text.html 'RECORDED'


  start_recording: ( from_external_event = true ) =>

    if from_external_event
      appcast.off 'stream:online', @start_recording

    ref = @

    L.rooms.start_recording @room_id, ( error, response ) ->
      if error
        ref.on_error error
        return

      ref.set_recording true

  start: ->
    log "[Record] start"

    if not appcast.get 'input_device'
      notify.info 'Select your input source'
      return

    @wait()

    if appcast.get 'stream:online'
      # if streaming, start recording!
      @start_recording false

    else
      # start streaming then start recording
      log "We should start streaming then start recording"
      appcast.start_stream @owner_id, appcast.get 'input_device'
      appcast.on 'stream:online', @start_recording



  stop: ->
    log "[Record] stop"

    @wait()

    ref = @

    L.rooms.stop_recording @room_id, ( error, callback ) ->

      if error
        notify.info "Error while stopping recording"
        return

      ref.set_recording false

      channel = pusher.subscribe "tape.#{ref.owner_id}"

      unbind_all = ->
        channel.unbind 'upload:finished', on_upload_finish
        channel.unbind 'upload:error', on_upload_error
        channel.unbind 'upload:failed', on_upload_failed

      on_upload_finish = (file) ->
        notify.info "File Uploaded: #{file}"
        unbind_all()
      on_upload_error = (error) ->
        log '[Record]on_upload_error', error
        notify.info "Upload Error"
        unbind_all()

      on_upload_failed = (error) ->
        log '[Record]on_upload_failed', error
        notify.info "Upload failed"
        unbind_all()

      channel.bind "upload:finished", on_upload_finish
      channel.bind "upload:error"   , on_upload_error
      channel.bind "upload:failed"  , on_upload_failed

  destroy: ->
    if @is_room_owner
      @text.off 'click', @on_button_clicked
