###
Adds the class 'hovered' to the element and to the target
The class is toggled on mouseover/mouseleave for desktops
and on click for touch devices
###

module.exports = class HoverTrigger
	opened: false
	klass: "hovered"

	constructor: ( @dom ) ->

		@target = $ @dom.data 'target'

		if @target.length <= 0
			log "[HoverTrigger] error. target not found", @dom.data( 'target' )
			return

		@dom.addClass "hover_dropdown_trigger"
		app.on "dropdown:opened", @on_dropdown_opened
		app.on "dropdown:closed", @on_dropdown_closed
		app.window.on "scroll", @close

		@set_listeners()



	set_listeners: ( ) ->

		if app.settings.touch_device
			@dom.on 'click', @toggle
		else
			@dom.on 'mouseover', @open
			@target.on 'mouseleave', @close

		
		

		
	toggle: ( e ) =>
		if @opened
			do @close
		else
			do @open

		e.stopPropagation()
		e.preventDefault()



	open: ( ) =>
		return if @opened
		@opened = true

		@dom.addClass @klass
		@target.addClass @klass

		app.emit "dropdown:opened", @uid

	close: ( ) =>
		return if not @opened
		@opened = false

		@dom.removeClass @klass
		@target.removeClass @klass

		app.emit "dropdown:closed", @uid

	on_dropdown_opened: ( data ) =>
		@close() if data isnt @uid

	on_dropdown_closed: ( data ) =>


	destroy: ->
		if app.settings.touch_device
			@dom.off 'click', @toggle
		else
			@dom.off 'mouseover', @open
			@target.off 'mouseleave', @close

		app.window.off "scroll", @close

		app.off "dropdown:opened", @on_dropdown_opened
		app.off "dropdown:closed", @on_dropdown_closed


