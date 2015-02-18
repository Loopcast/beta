module.exports = class Room
	constructor: ( @dom ) ->
		@open_modal()

	open_modal: ( ) ->
		modal_form = view.get_by_dom '#createroom_modal'

		if modal_form
			modal_form.open()