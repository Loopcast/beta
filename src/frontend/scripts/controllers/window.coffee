happens = require 'happens'

# create and export a new happens object
module.exports = happens( win = {} )

# event handling for window resize
win.obj = $ window
win.obj.on 'resize', on_resize = ->
	win.w = win.obj.width()
	win.h = win.obj.height()
	win.emit 'resize'

# trigger resize automatically after 100 ms
delay 100, on_resize

# global click event
$( 'html,body' ).on 'click', -> win.emit "body:clicked"