module.exports = ( dom ) ->
  h = dom.height()
  fixed = false

  app.window.on 'scroll', ( y ) ->

    if y >= h and not fixed
      fixed = true
      dom.addClass 'fixed'

    else if y < h and fixed
      fixed = false
      dom.removeClass 'fixed'