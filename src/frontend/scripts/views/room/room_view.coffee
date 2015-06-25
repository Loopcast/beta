user = require 'app/controllers/user'

module.exports = class RoomView

  room_created     : false
  room_subscribe_id: String
  is_room_owner    : false

  constructor: ( @dom ) ->
    view.on 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main
  
    delay 2, =>

      @room = view.get_by_dom( '.createroom' )

      if not @room

        console.error "problem finding view for .createroom"

        return  

      @_on_views_binded()        

  _on_views_binded: ->
    
    if @room and @room.is_create_page()

      ref = @

      @room.once 'room:created', (data) =>
        ref.on_room_created data._id, user.owner_id()

    else
      r = document.getElementById 'room_id'
      @on_room_created r.value, user.owner_id()

    view.off 'binded', @on_views_binded

  on_room_created: ( @room_id, @owner_id ) =>
    @room_created = true
    @is_room_owner = user.check_guest_owner()
