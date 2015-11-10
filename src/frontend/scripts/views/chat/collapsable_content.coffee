module.exports = class CollapsableContent
  expanded: false
  max_length: 100
  constructor: (@dom) ->
    @content = @dom.find '.collapsable_content'
    @original_height = @dom.outerHeight()

    @read_more = @dom.find '.read_more'

    log "[CollapsableContent] read_more", @read_more.length

    app.on 'set:updated', @check_length

    if @read_more.length > 0      
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
    h = @content.height() + 40
    # log "[Description] expand", h
    @dom.addClass('expanded').animate
      'height' : h

  collapse: =>
    return if not @expanded

    @expanded = false

    @dom.removeClass('expanded').animate
      'height' : @original_height


  check_length: =>
    delay 1, =>
      l = @content.text().length 
      log "[CollapsableContent] check_length", l, @max_length
      if l > @max_length
        # log "[Description] check_length", l, @max_length, "VISIBLE"
        @dom.addClass 'read_more_visible'
      else
        @dom.removeClass 'read_more_visible'
        # log "[Description] check_length", l, @max_length, "INVISIBLE"

  destroy: ->
    if @read_more.length > 0
      @read_more.off 'click', @toggle
      app.window.off 'scroll', @collapse
      app.off 'set:updated', @check_length
    super()

