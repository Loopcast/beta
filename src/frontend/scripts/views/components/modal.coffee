happens = require 'happens'

module.exports = class Modal
	opened: false
	constructor: ( @dom ) ->
		happens @

		@overlay = $ '.md_overlay'


	open: ( ) ->
		return if @opened
		@opened = true

		@dom.addClass 'md_show'

		log 'modal-close', @dom.data( 'modal-close' )


		if @dom.data( 'modal-close' )? and @dom.data( 'modal-close' ) isnt false
			@overlay.off( 'click' ).on( 'click', @close )

		@emit 'opened'

	close: ( ) =>
		return if not @opened
		@opened = false

		@dom.removeClass 'md_show'		

		@emit 'closed'