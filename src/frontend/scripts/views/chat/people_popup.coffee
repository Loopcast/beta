L = require '../../api/loopcast/loopcast'
transform = require 'lib/cloudinary/transform'
ChatView = require 'app/views/room/chat_view'

module.exports = class PeopleView extends ChatView
  tmpl: null
  cancel_hide: false
  visible: false

  constructor: (@dom) ->
    @tmpl = require 'templates/chat/people_popup'

    @dom.on 'mouseenter', @on_mouseover
    @dom.on 'mouseleave', @on_mouseout

    super @dom

  on_mouseover: =>
    @cancel_hide = true

  on_mouseout: =>
    @cancel_hide = false
    @hide()

  ###
  avatar: "https://res.cloudinary.com/loopcast/image/upload/v1431006022/ifollzoplab3eft56sfv.jpg"
  followers: 0
  id: "stefanoortisi"
  images: Object
  name: "Stefano Ortisi"
  occupation: Array[1]
  url: "/stefanoortisi"
  ###
  show: (data, el) -> 
    log "[Popup] show", data
    @cancel_hide = true
    @visible = true   
    @dom
      .show()
      .css('opacity', 0)
      .empty()
      .append @tmpl( data )

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

    delay 300, => @cancel_hide = false

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
    super()
    @dom.off 'mouseover', @on_mouseover
    @dom.off 'mouseout', @on_mouseout