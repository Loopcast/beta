module.exports = (event) ->
  # dot = undefined
  # eventDoc = undefined
  # doc = undefined
  # body = undefined
  # pageX = undefined
  # pageY = undefined
  # event = event or window.event

  # if event.pageX == null and event.clientX != null
  #   eventDoc = event.target and event.target.ownerDocument or document
  #   doc = eventDoc.documentElement
  #   body = eventDoc.body
  #   event.pageX = event.clientX + (doc and doc.scrollLeft or body and body.scrollLeft or 0) - (doc and doc.clientLeft or body and body.clientLeft or 0)
  #   event.pageY = event.clientY + (doc and doc.scrollTop or body and body.scrollTop or 0) - (doc and doc.clientTop or body and body.clientTop or 0)
  
  # log event.pageX, event.pageY
  el = $(event.currentTarget)
  offset = el.position()

  return {
    x: offset.left
    y: offset.top
    w: el.width()
    h: el.height()
  }