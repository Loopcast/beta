L        = require 'api/loopcast/loopcast'
RoomView = require './room_view'
module.exports = class SidebarRight extends RoomView
  on_room_created: ( @room_id, @owner_id ) =>

    visits = @dom.find '.stat_visits .number'
    likes = @dom.find '.stat_likes .number'
    listeners = @dom.find '.stat_listeners .number'

    ref = @

    L.rooms.stats @room_id, ( e, stats ) -> 
      log "[SidebarRight]", stats
      visits.html stats.visits
      likes.html stats.likes
      listeners.html stats.listeners

      ref.dom.removeClass 'not_loaded'

