happens = require 'happens'

module.exports = class Window
	obj: null
	w: 0
	h: 0
	constructor: ( ) ->
		happens @
		@obj = $ window
		@obj.on 'resize', @on_resize
		delay 100, @on_resize

	on_resize: ( ) =>
		@w = @obj.width()
		@h = @obj.height()

		@emit 'resize'