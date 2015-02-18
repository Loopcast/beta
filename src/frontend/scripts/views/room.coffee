module.exports = class Room
	constructor: ( @dom ) ->
		view.once 'binded', @on_view_binded

		@elements = 
			title   : @dom.find '.cover .name'
			genre   : @dom.find '.cover .genres'
			location: @dom.find '.cover .location'

		if @elements.title.html().length <= 0
			@elements.title.addClass 'hidden'

		if @elements.genre.html().length <= 0
			@elements.genre.addClass 'hidden'

		if @elements.location.html().length <= 0
			@elements.location.addClass 'hidden'
		


	on_view_binded: ( ) =>
		@modal = view.get_by_dom '#createroom_modal'
		@modal.on 'input:changed', @on_input_changed
		@open_modal()

	on_input_changed: ( data ) =>
		switch data.name
			when 'title', 'genre', 'location'
				@elements[ data.name ].html data.value

				if data.value.length > 0
					@elements[ data.name ].removeClass 'hidden'
				else
					@elements[ data.name ].addClass 'hidden'



	open_modal: ( ) ->
		@modal.open()
		
		