happens = require 'happens'
module.exports = class ProgressDragger
  constructor: ( @dom ) ->
    happens @
    @handler = @dom.find 'span'

    evts = app.settings.events_map
    @dom.on evts.down, @on_mouse_down
    app.window.obj.on evts.move, @on_mouse_move
    app.window.obj.on evts.up,   @on_mouse_up

  on_mouse_down: ( e ) =>
    
    log "e", e
    @dom = $ e.currentTarget
    @x_dom = @dom.offset().left
    @size = @dom.width()
    @x_start = e.pageX
    @dragging = true

    @emit 'drag:started'
    # log "[ProgressDragger] on_mouse_down", @dom.offset().left, @dom.position().left
    e.preventDefault()

  on_mouse_move: ( e ) =>
    return if not @dragging
    x = e.pageX
    total = x - @x_dom
    @perc = Math.min( 100, Math.max( 0,  100 * total / @size ) )
    
    @emit 'drag', @perc

    # log "[ProgressDragger] on_mouse_move", perc
    e.preventDefault()

  on_mouse_up: ( e ) =>
    return if not @dragging
    @emit 'drag:ended', @perc
    @dragging = false

  destroy: ->
    @dom.off evts.down, @on_mouse_down
    app.window.obj.off evts.move, @on_mouse_move
    app.window.obj.on evts.up,   @on_mouse_up

    @dom = null