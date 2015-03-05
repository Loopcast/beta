L     = require 'api/loopcast/loopcast'
navigation      = require 'app/controllers/navigation'
module.exports = class Room
	constructor: ( @dom ) ->
		view.once 'binded', @on_view_binded

		@elements = 
			title   : @dom.find '.cover .name'
			genre   : @dom.find '.cover .genres'
			location: @dom.find '.cover .location'
			cover   : @dom.find '.cover .cover_image'

		if @elements.title.html().length <= 0
			@elements.title.addClass 'hidden'

		if @elements.genre.html().length <= 0
			@elements.genre.addClass 'hidden'

		if @elements.location.html().length <= 0
			@elements.location.addClass 'hidden'
		


	on_view_binded: ( ) =>
		@modal = view.get_by_dom '#room_modal'
		@modal.on 'input:changed', @on_input_changed
		@modal.on 'submit', @on_modal_submit
		# @modal.open()

	on_input_changed: ( data ) =>
		switch data.name
			when 'title', 'genre', 'location'
				@elements[ data.name ].html data.value

				if data.value.length > 0
					@elements[ data.name ].removeClass 'hidden'
				else
					@elements[ data.name ].addClass 'hidden'
			when 'cover'
				@elements[ data.name ].css
					'background-image': "url(#{data.value.secure_url})"


	on_modal_submit: ( data ) =>
		log "[Room] on_modal_submit", data

		@modal.hide_message()
		@modal.show_loading()

		m = @modal

		L.rooms.create data, ( error, room ) ->

			if error

				msg = "Error. Try again."
				if error is "cant_have_two_live_rooms_with_same_url"
					console.error "Cant have two live rooms with same url"
					msg = "Cant have two live rooms with same url"
				m.hide_loading()
				m.show_message msg
				return console.error error
				
			console.info " ! Got room info!"
			console.warn room
			console.info " We should swap url HERE!"

			delay 1000, ->

				navigation.go_silent "/#{room.url}"

				m.close()

		
		
		