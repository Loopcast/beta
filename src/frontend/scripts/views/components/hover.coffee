happens = require 'happens'
module.exports = class Hover
	constructor: ( @dom ) ->
		return if app.settings.touch_device

		happens @
		
		@dom.on 'mouseover', @on_mouse_over
		@dom.on 'mouseleave', @on_mouse_leave

		@dom.addClass 'hover_object'

	on_mouse_over: ( ) =>
		@dom.addClass 'hovered'

	on_mouse_leave: ( ) =>
		@dom.removeClass 'hovered'

	destroy: ->
		@dom.off 'mouseover', @on_mouse_over
		@dom.off 'mouseleave', @on_mouse_leave