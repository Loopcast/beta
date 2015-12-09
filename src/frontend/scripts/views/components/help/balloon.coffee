module.exports = class Balloon
  visible: false
  orientation: "left"
  width: 0
  dom_offset: 0
  constructor: ( @dom ) ->
    @target = $ @dom.data( 'target' )
    if @dom.data 'orientation'
      @orientation = @dom.data 'orientation'

    if @dom.data 'offset'
      @dom_offset = @dom.data 'offset'

    @dom.addClass 'orientation_' + @orientation
    view.on 'binded', @on_views_binded

    @dom.find( '.button' ).on 'click', @hide
    @checkbox = @dom.find( 'input' )
    @checkbox.on 'change', @on_checkbox_changed

  on_checkbox_changed: =>
    log "[Balloon] set show help", @checkbox.is(":checked")

    app.session.set 'hide:help', @checkbox.is(":checked")


  on_views_binded: (scope) =>
    return if not scope.main
    view.off 'binded', @on_views_binded
    @dom.appendTo $( 'body' )


  on_resize: =>
    p = @target.offset()
    data = 
      'top': p.top - @offset

    
    if @orientation is 'left'
      data.left = p.left
    
    else if @orientation is 'bottom'
      data.top = p.top + @target.outerHeight() + 20
      # Centered
      data.left = p.left + @target.outerWidth() / 2 - @dom.outerWidth() / 2

    else
      data.left = p.left - @width

    
    data.left += @dom_offset
    
    log "[Balloon] resize", "top", data.top, "left", data.left, "orientation", @orientation, "t top", p.top, "t left", p.left, "width", @width, "dom offset", @dom_offset
    @dom.css data

  show: ->
    log "[Balloon] show!"
    @visible = true
    app.window.on 'resize', @on_resize
    @dom.addClass 'to_show'

    delay 1, =>
      @offset = @dom.outerHeight() + @target.outerHeight() - 10
      @width = @dom.width()
      @on_resize()
      @dom.addClass 'show'



  hide: =>
    @visible = false
    @dom.removeClass( 'to_show' ).removeClass( 'show' )
    app.window.off 'resize', @on_resize

  toggle: ->
    if @visible
      @hide()
    else
      @show()


  destroy: ->
    if @visible
      app.window.off 'resize', @on_resize

    @dom.find( '.button' ).off 'click', @hide

    @dom.remove()


