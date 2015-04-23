module.exports = class Balloon
  visible: false
  constructor: ( @dom ) ->
    @target = $ @dom.data( 'target' )
    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main
    view.off 'binded', @on_views_binded
    @dom.appendTo $( 'body' )


  on_resize: =>
    p = @target.offset()

    @dom.css
      'left': p.left
      'top': p.top - @offset

  show: ->
    @visible = true
    app.window.on 'resize', @on_resize
    @dom.addClass 'to_show'


    delay 1, =>
      @offset = @dom.outerHeight() + @target.outerHeight()

      @on_resize()
      @dom.addClass 'show'



  hide: ->
    @visible = false
    @dom.removeClass( 'to_show' ).removeClass( 'show' )
    app.window.off 'resize', @on_resize


  destroy: ->
    if @visible
      app.window.off 'resize', @on_resize

    @dom.remove()


