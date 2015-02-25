happens = require 'happens'

module.exports = class StartStop
	started     : false
	first_click : true

	constructor: (@dom) ->
		happens @
	
		@dom.addClass 'start_stop'
		@dom.on 'click', @toggle

		if @dom.data( 'width' ) is 'fixed'
			@lock_width()

	lock_width: ->
		start_button = @dom.find '.start'
		stop_button  = @dom.find '.stop'

		w = Math.max( start_button.width(), stop_button.width() ) + 2
		start_button.width w
		stop_button.width w


	toggle : =>

		if @started
			@stop()
		else
			@start()

		@first_click = false

	stop : ->
		return if not @started

		@started = false

		@dom.removeClass "started"

		@emit 'change', 'stop'


	start : ->
		return if @started

		@started = true

		@dom.addClass "started"

		@emit 'change', 'start'