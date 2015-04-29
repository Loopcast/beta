L = require '../../api/loopcast/loopcast'
transform = require 'shared/transform'
ChatView = require 'app/views/room/chat_view'
user = require 'app/controllers/user'

module.exports = class People extends ChatView

  listeners    : []
  listeners_map: []

  constructor: ( @dom ) ->
    super @dom
    @listeners = []


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
    if user.is_logged()
      # Adding the user himself
      @send_message "added"

  send_message: ( method ) ->
    data = 
      method: method
      room_id: @room_id
      owner_id: @owner_id

    # log "[People] send_message", data

    L.chat.listener data, ( error, response ) ->
      if error
        console.error "sending message: ", error
        return



  on_listener_added: ( listener ) =>

    @_on_listener_added listener
    

  _on_listener_added: ( listener ) ->
    listener = listener.user
    if @listeners_map[ listener.id ]?
      log "[People] listener already added", listener.id
      return
      
    log "[People] on_listener_added", listener
    @listeners.push listener
    @listeners_map[ listener.id ] = listener

    @listeners_wrapper.append @tmpl( listener )
    @update_counter()

  on_listener_removed: ( listener ) =>
    # log "[People] on_listener_removed", listener

    @listeners_wrapper.find( '#listener_' + listener.id ).remove()

    @listeners_map[ listener.id ] = null
    i = 0
    for item in @listeners
      if item.id is listener.id
        break
      i++

    @listeners.splice i, 1


    @update_counter()

  update_counter: ->
    @counter.html "(#{@listeners.length})"

  destroy: ->
    @listeners = []
    @send_message "removed"

    if @is_room_created
      @dom.off 'mouseover', '.img_wrapper', @on_mouse_over
      @dom.off 'mouseout', '.img_wrapper', @on_mouse_out
    super()


