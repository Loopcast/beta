module.exports = class ModalHandler
	constructor: ( @dom ) ->
		view.once 'binded', @on_ready

	on_ready: ( ) =>
		modal_target = view.get_by_dom @dom.data( 'modal' )
		@dom.on 'click', -> modal_target.open()