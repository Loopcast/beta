module.exports = class Fullscreen
	constructor: ( @dom ) ->
		app.window.on 'resize', @on_resize
		do @on_resize

	on_resize: ( ) =>
		@dom.css
 			'width' : '100%'
 			'height' : app.window.h - app.settings.header_height
