L               = require 'api/loopcast/loopcast'
RoomView = require 'app/views/room/room_view'
module.exports = class MobileRoomPlayTrigger extends RoomView
  room_info : null
  playing: false
  constructor: ( @dom ) ->
    @dom.on 'click', @toggle
    super @dom

  toggle: =>
    log "[MobileRoomPlayTrigger] toggle"
    if @playing
      @stop()
    else
      @play()
  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    L.rooms.info @room_id, (error, response) =>

      if not error
        @room_info = response

        
  play: ->
    return if @playing

    @playing = true

    app.player.play @room_info

  stop: ->
    return if not @playing
    @playing = false

    

  destroy: ->
    @dom.off 'click', @toggle    

