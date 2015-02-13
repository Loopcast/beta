happens = require 'happens'

# create new happens object
happens( win = {} )

# event handling for window resize
win.obj = $ window
win.obj.on 'resize', on_resize = ->
	win.w = win.obj.width()
	win.h = win.obj.height()
	win.emit 'resize'

# trigger resize automatically after 100 ms
delay 100, on_resize

# global click event
$( 'html,body' ).on 'click', => @emit "body:clicked"


module.exports = win