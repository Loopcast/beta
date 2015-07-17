L        = require 'app/api/loopcast/loopcast'
RoomView = require 'app/views/room/room_view'
notify   = require 'app/controllers/notify'
happens  = require 'happens'
moment = require 'moment'
time_to_string = require 'app/utils/time/time_to_string'
now_to_seconds = require 'app/utils/time/now_to_seconds'

module.exports = class ButtonWithTimer extends RoomView
  active: false
  waiting: false
  interval: null

  constructor:  ( @dom ) ->
    happens @
    @text = @dom.find 'a'
    super @dom

  wait: ->
    # log "[GoLive] wait"
    @waiting = true
    @text.html "..."

  on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    # log "[GoLive] on_room_created"
    return unless @is_room_owner

    @text.on 'click', @on_button_clicked


    @timer = @dom.find '.right_part'
    # log "[ButtonWithTimer]", @timer.length

  on_button_clicked: =>
    # TODO: make it clever
    return if @waiting

    if not @active
      @start()
    else
      @stop()

  set_active: ( active ) ->

    # log "[Record] set_active", active
    
    @waiting = false
    @active  = active

    @emit 'changed', @active

    if @active
      @text.html @active_text
      @start_timer()
    else
      @text.html @inactive_text
      @stop_timer()

  on_error: ( error, origin = 'stream:error' ) =>
    @waiting = false

    return if not error
    @text.html "ERROR"
    # log "[Record] on_error. origin", error, origin

    notify.error "An error occurred, please get in touch using the support icon in the bottom right"

  start_timer: ->
    L.rooms.info @room_id, (error, response) =>
      return if error
      started_at = response.room.status[ @type ].started_at 
      # log "[ButtonWithTimer] room info", error, response, started_at

      @start_time = moment( started_at )
      @interval = setInterval @tick, 1000

  stop_timer: ->
    clearInterval @interval

  tick: =>
    seconds = now_to_seconds @start_time
    time = time_to_string seconds
    @timer.html time.str


