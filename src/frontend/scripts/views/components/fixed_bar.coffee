module.exports = ( dom ) ->
  h = dom.height()
  fixed = false

  app.window.on 'scroll', ( data ) ->
    y = data.y

    if y >= h and not fixed
      fixed = true
      dom.addClass 'fixed'

    else if y < h and fixed
      fixed = false
      dom.removeClass 'fixed'


  obj = $ '[data-submenu]'
  if obj.length > 0
    submenu = obj.data 'submenu'
    log "[Header] check submenu", obj, submenu
    $( ".#{submenu}" ).addClass 'selected'


  links = dom.find 'li'

  links.find( 'a' ).on 'click', ->
    links.removeClass 'selected'
    $(@).parent().addClass 'selected'
