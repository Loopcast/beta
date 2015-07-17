L        = require 'api/loopcast/loopcast'
RoomView = require './room_view'
module.exports = class SidebarRight extends RoomView
  stats: 
    visits: 0
    likes: 0
    listeners: 0
  likes: null
  visits: null
  listeners: null
  on_room_created: ( @room_id, @owner_id ) =>

    @visits = @dom.find '.stat_visits .number'
    @likes = @dom.find '.stat_likes .number'
    @listeners = @dom.find '.stat_listeners .number'

    ref = @

    L.rooms.stats @room_id, ( e, stats ) -> 
      log "[SidebarRight]", stats
      ref.visits.html stats.visits
      ref.likes.html stats.likes
      ref.listeners.html stats.listeners

      ref.stats.visits    = stats.visits
      ref.stats.likes     = stats.likes
      ref.stats.listeners = stats.listeners

      ref.dom.removeClass 'not_loaded'

  on_like: (data) =>
    @likes.html ++@stats.likes
    log "[SidebarRight] on_like", data

  on_unlike: (data) =>
    @likes.html --@stats.likes
    log "[SidebarRight] on_unlike", data

  on_listener_added: ( data ) =>
    @listeners.html ++@stats.listeners
    log "[SidebarRight] on_listener_added", @stats.listeners

  on_listener_removed: ( data ) =>
    @listeners.html --@stats.listeners
    log "[SidebarRight] on_listener_removed", @stats.listeners

