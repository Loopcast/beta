L = require '../../api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
ChatView = require 'app/views/room/chat_view'
user = require 'app/controllers/user'

module.exports = class People extends ChatView

  listeners    : []
  listeners_map: []

  constructor: ( @dom ) ->
    super @dom
    @listeners = []
    @listeners_map = []


  on_room_created: ( @room_id, @owner_id ) =>
    super @room_id, @owner_id

    @popup = view.get_by_dom '.chat_user_popup'
    @tmpl = require 'templates/chat/chat_listener'

    @counter = @dom.find '.number'
    @listeners_wrapper = @dom.find '.users'

    @check_user()

    @dom.on 'mouseover', '.img_wrapper', @on_mouse_over
    @dom.on 'mouseout', '.img_wrapper', @on_mouse_out



  on_mouse_over: ( e ) =>
    el = $ e.target
    listener_id = el.data 'id'
    if @listeners_map[ listener_id ]?
      @popup.show @listeners_map[ listener_id ], $(e.target)

  on_mouse_out: ( e ) =>
    @popup.hide()

    
  check_user: ->
    # if user.is_logged()
    #   @send_listener_message()

  send_listener_message:  ->

    L.chat.enter @room_id, ( error, response ) ->
      if error
        console.error "[API] error. on_listener_added: ", error
        return



  on_listener_added: ( listener ) =>
    # log "[People] ####### on_listener_added", listener.user.username
    @_on_listener_added listener
    

  _on_listener_added: ( listener ) ->
    listener = listener.user

    listener.images = transform.all listener.avatar
    if @listeners_map[ listener.socket_id ]?
      log "[People] listener already added", listener.socket_id
      return
      
    log "[People] on_listener_added", listener
    @listeners.push listener
    @listeners_map[ listener.socket_id ] = listener

    @listeners_wrapper.append @tmpl( listener )
    @update_counter()

  on_listener_removed: ( listener ) =>
    log "[People] on_listener_removed", listener
    
    @listeners_wrapper.find( '#listener_' + listener.socket_id ).remove()

    @listeners_map[ listener.socket_id ] = null
    i = 0
    for item in @listeners
      if item.socket_id is listener.socket_id
        break
      i++

    @listeners.splice i, 1


    @update_counter()

  update_counter: ->
    @counter.html "(#{@listeners.length})"

  destroy: ->
    @listeners = []
    @listeners_map = []
    # @send_message "removed"

    if @is_room_created
      @dom.off 'mouseover', '.img_wrapper', @on_mouse_over
      @dom.off 'mouseout', '.img_wrapper', @on_mouse_out
    super()


