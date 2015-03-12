module.exports = class Fullscreen
	factor: 1
	constructor: ( @dom ) ->
		@dom.addClass 'fullscreen'
		if @dom.data 'factor'
			@factor = @dom.data 'factor'

		app.window.on 'resize', @on_resize
		do @on_resize

	on_resize: ( ) =>
		@dom.css
 			'width' : '100%'
 			'height' : (app.window.h - app.settings.header_height)*@factor


  destroy: ->
    app.window.off 'resize', @on_resize    
