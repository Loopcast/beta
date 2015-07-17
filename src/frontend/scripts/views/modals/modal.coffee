happens = require 'happens'

module.exports = class Modal
  opened: false
  constructor: ( @dom ) ->
    happens @
    @overlay = $ '.md_overlay'
    @dom = @dom.remove()
    @overlay.before @dom

  open: ( ) =>
    log "[Modal] open"
    return if @opened
    @opened = true

    @dom.addClass 'md_visible'
    delay 10, =>
      @dom.addClass 'md_show'


    if @dom.data( 'modal-close' )? and @dom.data( 'modal-close' ) isnt false
      @close_on_click_outside()
    else
      @disable_close_on_click_outside()

    @emit 'opened'

  close_on_click_outside: ->
    @overlay.off( 'click' ).on( 'click', @close )

  disable_close_on_click_outside: ->
    @overlay.off( 'click' )

  close: ( ) =>
    if not @opened
      log "[Modal] it's already closed!"
      return

    @opened = false

    @dom.removeClass 'md_show'    
    delay 400, =>

      @dom?.removeClass 'md_visible'

      do @hide_loading

      @emit 'closed' if @emit?
        

  show_loading: ( ) ->    
    @dom.addClass 'loading'

  hide_loading: ( ) ->
    @dom?.removeClass 'loading'

  destroy: ->
    log "[Modal] remove"
    @dom.remove()
    @dom = null
    @on = null
    @off = null
    @once = null
