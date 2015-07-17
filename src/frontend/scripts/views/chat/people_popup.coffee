L = require '../../api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
ChatView = require 'app/views/room/chat_view'

module.exports = class PeopleView extends ChatView
  tmpl: null
  cancel_hide: false
  visible: false
  follow_button: null



  constructor: (@dom) ->
    # log "[PeoplePopup] constructor"
    @tmpl = require 'templates/chat/people_popup'

    @dom.on 'mouseenter', @on_mouseover
    @dom.on 'mouseleave', @on_mouseout

    view.on 'binded', @on_views_binded


    super @dom


    

  on_mouseover: =>
    @cancel_hide = true

  on_mouseout: =>
    @cancel_hide = false
    @hide()

  ###
  avatar: "https://res.cloudinary.com/loopcast/image/upload/v1431006022/ifollzoplab3eft56sfv.jpg"
  likes: 0
  id: "stefanoortisi"
  images: Object
  name: "Stefano Ortisi"
  occupation: Array[1]
  url: "/stefanoortisi"
  ###

  normalize_data : ( data ) ->
    data.likes ?= 0

    o = data.occupation

    data.occupation = ""

    if o.constructor is Array
      if o.length > 0 and o[0] isnt "undefined"
        data.occupation = o[0]
    
    data


  show: (data, el) -> 

    data = @normalize_data data

    # log "[Popup] show", data

    @cancel_hide = true
    @visible = true   
    @dom
      .show()
      .css('opacity', 0)
      .find( '.outer_inner' )
      .html @tmpl( data )

    delay 1, =>
      p = el.position()
      w1 = 55
      h1 = 55
      h = @dom.height()
      w = @dom.width()

      left = Math.max(0, p.left - (w/2) + 17 )
      top = p.top - h - 50

      if top < 0
        top = p.top + 35

      @dom.css
        left   : left
        top    : top
        opacity: 1


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

  destroy: ->
    # log "[PeoplePopup] destroy"
    super()
    @dom.off 'mouseover', @on_mouseover
    @dom.off 'mouseout', @on_mouseout