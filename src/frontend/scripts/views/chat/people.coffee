L = require '../../api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
ChatView = require 'app/views/room/chat_view'
user = require 'app/controllers/user'

module.exports = class People extends ChatView
  listeners_map: []

  constructor: ( @dom ) ->
    super @dom
    @listeners_map = []


  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @popup = view.get_by_dom '.chat_user_popup'
    @tmpl = require 'client_templates/chat/chat_listener'

    @counter = @dom.find '.number'
    @listeners_wrapper = @dom.find '.users'

    @dom.on 'mouseover', '.img_wrapper', @on_mouse_over
    @dom.on 'mouseout', '.img_wrapper', @on_mouse_out



  on_mouse_over: ( e ) =>
    el = $ e.target
    listener_id = el.data 'id'
    if @listeners_map[ listener_id ]?
      @popup.show @listeners_map[ listener_id ], $(e.target)

  on_mouse_out: ( e ) =>
    @popup.hide()


  on_listener_added: ( data ) =>
    # log "[People] ####### on_listener_added", listener.user.username
    @_on_listener_added data.item, data.total
    

  _on_listener_added: ( listener, total ) ->

    listener.images = transform.all listener.avatar
    if @listeners_map[ listener.socket_id ]?
      # log "[People] listener already added", listener.socket_id
      return
      
    # log "[People] on_listener_added", listener
    @listeners_map[ listener.socket_id ] = listener

    @listeners_wrapper.append @tmpl( listener )
    @update_counter total

  on_listener_removed: ( data ) =>
    listener = data.item
    # log "[People] on_listener_removed", listener
    
    @listeners_wrapper.find( '#listener_' + listener.socket_id ).remove()

    @listeners_map[ listener.socket_id ] = null

    @update_counter data.total

  update_counter: (total) ->
    @counter.html "(#{total})"

  destroy: ->
    @listeners_map = []

    if @is_room_created
      @dom.off 'mouseover', '.img_wrapper', @on_mouse_over
      @dom.off 'mouseout', '.img_wrapper', @on_mouse_out
    super()


