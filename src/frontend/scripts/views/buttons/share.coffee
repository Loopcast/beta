module.exports = class Share

  opened    : false
  handler   : null
  black_box : null
  input     : null
  copy_btn  : null

  constructor: (@dom) ->
    ref = @

    html = require 'templates/buttons/share'

    data = 
      link: @dom.data 'permalink'
      
    @dom.append html( data )


    @handler   = @dom.find '.ss-action'
    @black_box = @dom.find '.share_box' 
    @input     = @dom.find 'input'
    @copy_btn  = @dom.find '.button'

    @handler.on 'click', @toggle
    @dom.on 'click',  (e) -> e.stopPropagation()
    @input.on 'click', @select
    @copy_btn.on 'click', @on_copy_clicked
    app.on 'share:opened', @on_share_opened
    app.window.on 'body:clicked', @close
    app.window.on 'scroll', @close

  on_share_opened: ( uid ) =>
    if uid isnt @uid
      @close()

  on_copy_clicked: =>
    @input[ 0 ].select()
    if app.settings.browser.OS is "Mac"
      text = "Press CMD + C to copy the link"
    else
      text = "Press Ctrl + C to copy the link"
    alert text


  toggle : (e) =>
    if @opened 
      @close()
    else
      @open()

    e.preventDefault()

  close : =>
    return if not @opened
    @opened = false
    @dom.removeClass 'opened'

  open : =>
    return if @opened
    @opened = true
    app.emit 'share:opened', @uid

    # Check the position of the handler
    top = @handler.offset().top
    y = app.window.y
    h = @black_box.height()
    diff = top - y
    log 'position', diff, h+100

    if diff < h + 100
      @dom.addClass 'on_bottom'
    else
      @dom.removeClass 'on_bottom'

    @dom.addClass 'opened'

  update_link: ( link ) ->
    @input.val link


  destroy: ->
    @handler.off 'click', @toggle
    @dom.off 'click'
    @input.off 'click', @select
    @copy_btn.off 'click', @on_copy_clicked
    app.off 'share:opened', @on_share_opened
    app.window.off 'body:clicked', @close
    app.window.off 'scroll', @close