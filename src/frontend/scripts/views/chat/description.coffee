EditableText = require 'app/views/components/editables/editable_text'

module.exports = class Description extends EditableText
  max_length: 100
  expanded: false
  constructor: (@dom) ->
    super @dom  

    @t = @dom.find '.text'

    @parent = @dom.parent()
    @wrapper = @parent.parent()
    @original_height = @wrapper.outerHeight()

    # log "[Description] original_height", @original_height
    @on 'changed', @check_length
    @read_more = @parent.find '.read_more'

    @check_length()

    @read_more.on 'click', @toggle
    app.window.on 'scroll', @collapse

  toggle: =>
    if @expanded
      @collapse()
    else
      @expand()

  expand: =>
    return if @expanded

    @expanded = true
    h = @dom.height() + 40
    # log "[Description] expand", h
    @wrapper.addClass('expanded').animate
      'height' : h

  collapse: =>
    return if not @expanded

    @expanded = false

    @wrapper.removeClass('expanded').animate
      'height' : @original_height



  open_edit_mode: (e) =>
    super e
    @collapse()
    @wrapper.addClass 'edit_mode'

  close_read_mode: =>
    super()

    @wrapper.removeClass 'edit_mode'




  check_length: =>
    delay 1, =>
      l = @t.html().length 
      # log "[Description] check_length", l, @max_length
      if l > @max_length
        # log "[Description] check_length", l, @max_length, "VISIBLE"
        @parent.addClass 'read_more_visible'
      else
        @parent.removeClass 'read_more_visible'
        # log "[Description] check_length", l, @max_length, "INVISIBLE"

  destroy: ->
    @off?( 'changed', @check_length )
    @read_more.off 'click', @toggle
    app.window.off 'scroll', @collapse
    super()
