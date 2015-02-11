module.exports = class HoverTrigger
	opened: false

	constructor: ( @dom ) ->
		@target = $ @dom.data 'target'

		if @target.length <= 0
			log "[HoverTrigger] error. target not found", @dom.data( 'target' )
			return

		if app.settings.touch_device
			@dom.on 'click', @toggle
			$('html,body').on 'click', @on_mouse_leave
		else
			@dom.on 'mouseover', @on_mouse_over
			@target.on 'mouseleave', @on_mouse_leave

	toggle: ( e ) =>
		if @opened
			do @on_mouse_leave
		else
			do @on_mouse_over

		e.stopPropagation()

	on_mouse_over: ( ) =>
		return if @opened
		@opened = true

		@dom.addClass "hovered"
		@target.addClass "hovered"

	on_mouse_leave: ( ) =>
		return if not @opened
		@opened = false

		@dom.removeClass "hovered"
		@target.removeClass "hovered"


