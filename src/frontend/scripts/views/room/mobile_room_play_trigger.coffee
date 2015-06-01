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

  play: ->
    return if @playing

    @playing = true

    if @room_info
      @_play()
    else
      L.rooms.info @room_id, (error, response) =>

        if not error
          @room_info = response
          @_play()
          
        else
          log "[Room] on_room_live error", error


  _play: ->
    app.player.play @room_info
    
  stop: ->
    return if not @playing
    @playing = false

    

  destroy: ->
    @dom.off 'click', @toggle    

