module.exports = class Room
	constructor: ( @dom ) ->

		view.on 'binded', @on_view_binded

	on_view_binded: ( ) =>
		
		@open_modal()

	open_modal: ( ) ->
		modal_form = view.get_by_dom '#createroom_modal'

		log 'modal_form', modal_form
		if modal_form
			modal_form.open()