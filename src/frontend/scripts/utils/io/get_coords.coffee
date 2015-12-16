module.exports = (event) ->

  el = $(event.currentTarget)
  offset = el.offset()


  data = 
    x: offset.left
    y: offset.top
    w: el.width()
    h: el.height()

  log "[Coords]", "offset: ", data.x, data.y

  return data