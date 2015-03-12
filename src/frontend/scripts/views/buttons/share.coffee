module.exports = (dom) ->
  opened    = false
  handler   = null
  black_box = null
  ref       = @
  input     = null
  copy_btn  = null

  init = ->
    html = require 'templates/buttons/share'

    data = 
      link: dom.data 'permalink'
      
    dom.append html( data )


    handler   = dom.find '.ss-action'
    black_box = dom.find '.share_box' 
    input     = dom.find 'input'
    copy_btn  = dom.find '.button'
    handler.on 'click', toggle


    dom.on 'click',  (e) -> e.stopPropagation()

    input.on 'click', ->
      @select()

    copy_btn.on 'click', ->
      input[ 0 ].select()
      if app.settings.browser.OS is "Mac"
        text = "Press CMD + C to copy the link"
      else
        text = "Press Ctrl + C to copy the link"
      alert text
      


    app.on 'share:opened', (uid) ->
      if uid isnt ref.uid
        close()

    app.window.on 'body:clicked', close
    app.window.on 'scroll', close

  toggle = (e)->
    if opened 
      close()
    else
      open()

    e.preventDefault()

  close = ->
    return if not opened
    opened = false
    dom.removeClass 'opened'

  open = ->
    return if opened
    opened = true
    app.emit 'share:opened', ref.uid

    # Check the position of the handler
    top = handler.offset().top
    y = app.window.y
    h = black_box.height()
    diff = top - y
    log 'position', diff, h+100

    if diff < h + 100
      dom.addClass 'on_bottom'
    else
      dom.removeClass 'on_bottom'

    dom.addClass 'opened'

  init()