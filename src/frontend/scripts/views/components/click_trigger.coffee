HoverTrigger = require 'app/views/components/hover_trigger'

module.exports = class ClickTrigger extends HoverTrigger

	set_listeners: ( ) ->
		@dom.on 'click', @toggle
		app.window.on "body:clicked", @close

