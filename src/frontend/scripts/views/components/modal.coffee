module.exports = class Modal
	opened: false
	constructor: ( @dom ) ->
		@overlay = $ '.md_overlay'


	open: ( ) ->
		return if @opened
		@opened = true

		@dom.addClass 'md_show'

		@overlay.off( 'click' ).on( 'click', @close )

	close: ( ) =>
		return if not @opened
		@opened = false

		@dom.removeClass 'md_show'		