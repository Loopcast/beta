RoomView = require 'app/views/room/room_view'

module.exports = class HelpButton extends RoomView

  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    return if not @is_room_owner

    # log "[HelpButton] on_room_created"
    @balloon = view.get_by_dom '#help_balloon'

    @dom.on 'mouseover', @show_popup
    @dom.on 'mouseout', @hide_popup
    @balloon.dom.on 'mouseover', @show_popup
    @balloon.dom.on 'mouseout', @hide_popup

  show_popup: =>
    clearInterval @interval
    @balloon.show()

  hide_popup: =>
    clearInterval @interval
    @interval = setInterval @_hide_popup, 500

  _hide_popup: =>
    @balloon.hide()

  destroy: ->
    if @is_room_owner
      @dom.off 'mouseover', @show_popup
      @dom.off 'mouseout', @hide_popup
      @balloon.dom.off 'mouseover', @show_popup
      @balloon.dom.off 'mouseout', @hide_popup
      view.destroy_view @balloon

