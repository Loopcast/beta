module.exports = class ModalHandler
	constructor: ( @dom ) ->
		view.on 'binded', @on_ready

	on_ready: ( ) =>
		log "[ModalHandler] on_ready"
		modal_target = view.get_by_dom @dom.data( 'modal' )
		@dom.on 'click', -> modal_target.open()