happens = require 'happens'

module.exports = class Modal
	opened: false
	constructor: ( @dom ) ->
		happens @

		@overlay = $ '.md_overlay'


	open: ( ) ->
		return if @opened
		@opened = true

		@dom.addClass 'md_visible'
		delay 10, =>
			@dom.addClass 'md_show'

		log 'modal-close', @dom.data( 'modal-close' )


		if @dom.data( 'modal-close' )? and @dom.data( 'modal-close' ) isnt false
			@overlay.off( 'click' ).on( 'click', @close )

		@emit 'opened'

	close: ( ) =>
		if not @opened
			log "[Modal] it's already closed!"
			return

		@opened = false

		@dom.removeClass 'md_show'		
		delay 300, =>
			@dom.removeClass 'md_visible'

		do @hide_loading

		@emit 'closed'

	show_loading: ( ) ->		
		@dom.addClass 'loading'

	hide_loading: ( ) ->
		@dom.removeClass 'loading'