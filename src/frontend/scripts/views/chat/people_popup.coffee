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

  show: (data, el) -> 
    @cancel_hide = true
    @visible = true   
    @dom
      .show()
      .css('opacity', 0)
      .empty()
      .append @tmpl( data )

    delay 1, =>
      p = el.offset()
      w1 = 55
      h1 = 55
      h = @dom.height()
      w = @dom.width()

      left = p.left - (w/2) + 17
      top = p.top - h - 90

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