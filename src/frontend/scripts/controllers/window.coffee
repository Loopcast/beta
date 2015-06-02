happens = require 'happens'
settings = require 'app/utils/settings'

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

  settings.theme = 'desktop'
  if win.w < settings.threshold_theme 
    settings.theme = "mobile"

  win.emit 'resize'

# trigger resize automatically after 100 ms
delay 100, on_resize

# global click event
$( 'body' ).on 'click', -> win.emit "body:clicked"


# scroll event

win.obj.on 'scroll', on_scroll = ->
  y = win.obj.scrollTop();

  d = if y > win.y then "down" else "up"
  win.y = y
  win.emit 'scroll', 
    y: win.y
    direction: d

# trigger scroll automatically after 100 ms
delay 100, on_scroll