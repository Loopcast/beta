L             = require '../../api/loopcast/loopcast'
transform     = require 'lib/cloudinary/transform'
ChatView      = require 'app/views/room/chat_view'
user          = require 'app/controllers/user'
# check_input   = require 'lib/tools/strings/check_input'

module.exports = class PeoplePopup extends ChatView
  tmpl: null
  cancel_hide: false
  visible: false
  follow_button: null
  current_id: null

  constructor: (@dom) ->
    # log "[PeoplePopup] constructor"
    @tmpl = require 'client_templates/chat/people_popup'

    @dom.on 'mouseenter', @on_mouseover
    @dom.on 'mouseleave', @on_mouseout

    view.on 'binded', @on_views_binded

    super @dom
    

  on_mouseover: =>
    @cancel_hide = true

  on_mouseout: =>
    @cancel_hide = false
    @hide()

  show: (id, coords, position) -> 
    return if @current_id is id

    @current_id = id

    user.info_by_id id, (response) =>
      data = 
        avatar: response.info.avatar
        id: response._id
        name: response.info.name
        username: response.info.username
        likes: response.likes
        occupation: response.info.occupation
        images: transform.all( response.info.avatar )
        url : '/' + response.info.username
    
      
      log "[Popup] show", data, user.is_me( data.id ), position

      @cancel_hide = true
      @visible     = true   


      # Build the html of the popup and show it
      h = if user.is_me( data.id ) then 170 else 230
      w = 220

      @dom
        .show()
        .css
          opacity : 1 
          left: coords.x - (w/2) + (coords.w/2)
          top: coords.y - h - 10
        .find( '.outer_inner' )
        .html( @tmpl( data ) )

      if not @follow_button
        view.bind 'body'
      else
        is_guest = data.name is "Guest"
        @follow_button.set_user_id data.id, is_guest


      delay 300, => @cancel_hide = false

  on_views_binded: ( data ) =>
    @follow_button = view.get_by_dom '.popup_follow_button'

    if @follow_button
      view.off 'binded', @on_views_binded


  hide: ->
    delay 200, =>
      if not @cancel_hide
        @_hide()

  _hide: ->
    @visible = false
    @dom.css 'opacity', 0
    delay 200, => 
      if not @visible
        @dom.hide()

        @current_id = null

  destroy: ->
    # log "[PeoplePopup] destroy"
    super()
    @dom.off 'mouseover', @on_mouseover
    @dom.off 'mouseout', @on_mouseout