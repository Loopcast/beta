happens = require 'happens'

# create and export a new happens object
win =
  obj : Object
  w   : 0
  h   : 0
  y   : 0

module.exports = happens( win )



# event handling for window resize
win.obj = $ window
win.obj.on 'resize', on_resize = ->
	win.w = win.obj.width()
	win.h = win.obj.height()
	win.emit 'resize'

# trigger resize automatically after 100 ms
delay 100, on_resize

log "one"


# global click event
$( 'body' ).on 'click', -> win.emit "body:clicked"


# scroll event
win.obj.on 'scroll', on_scroll = ->
  win.y = win.obj.scrollTop();
  win.emit 'scroll', win.y

# trigger scroll automatically after 100 ms
delay 100, on_scroll