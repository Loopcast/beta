happens = require 'happens'
module.exports = class ProgressDragger
  moving: false
  constructor: ( @dom ) ->
    happens @
    @handler = @dom.find 'span'

    evts = app.settings.events_map
    @dom.on evts.down, @on_mouse_down
    app.window.obj.on evts.move, @on_mouse_move
    app.window.obj.on evts.up,   @on_mouse_up

  get_x : ( e ) ->
    if e.pageX
      return e.pageX
    return e.originalEvent.touches[0].pageX
    

  on_mouse_down: ( e ) =>
    
    @dom = $ e.currentTarget
    @x_dom = @dom.offset().left
    @size = @dom.width()
    @x_start = @get_x e
    @dragging = true

    @emit 'drag:started'
    # log "[ProgressDragger] on_mouse_down", @dom.offset().left, @dom.position().left
    # e.preventDefault()

  on_mouse_move: ( e ) =>
    return if not @dragging
    x = @get_x e
    total = x - @x_dom
    @perc = Math.min( 100, Math.max( 0,  100 * total / @size ) )
    @moving = true
    @emit 'drag', @perc

    log "[ProgressDragger] on_mouse_move", @perc
    e.preventDefault()

  on_mouse_up: ( e ) =>
    return if not @dragging
    log "[ProgressDragger] on_mouse_up", @perc
    @emit 'drag:ended', @perc

    if not @moving
      @emit 'click', e
    @dragging = false
    @moving = false

  destroy: ->
    @dom.off evts.down, @on_mouse_down
    app.window.obj.off evts.move, @on_mouse_move
    app.window.obj.on evts.up,   @on_mouse_up

    @dom = null