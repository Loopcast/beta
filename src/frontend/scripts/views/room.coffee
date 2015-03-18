L           = require 'api/loopcast/loopcast'
navigation  = require 'app/controllers/navigation'
Strings     = require 'app/utils/string'
user_controller = require 'app/controllers/user'

module.exports = class Room
	constructor: ( @dom ) ->
		view.once 'binded', @on_view_binded
		user_controller.on 'user:logged', @on_user_logged
		user_controller.on 'user:unlogged', @on_user_unlogged

		@elements = 
			title       : @dom.find '.cover .name'
			genre       : @dom.find '.cover .genres'
			location    : @dom.find '.cover .location'
			cover       : @dom.find '.cover .cover_image'
			description : @dom.find '.chat_header p'

		if Strings.is_empty( @elements.title.html() )
			@elements.title.addClass 'hidden'

		if Strings.is_empty( @elements.genre.html() )
			@elements.genre.addClass 'hidden'

		if Strings.is_empty( @elements.location.html() )
			@elements.location.addClass 'hidden'



	on_view_binded: ( ) =>
		@modal = view.get_by_dom '#room_modal'
		@modal.on 'input:changed', @on_input_changed
		@modal.on 'submit', @on_modal_submit

		if location.pathname is '/rooms/create'
			@modal.open()
		

	on_input_changed: ( data ) =>
		switch data.name
			when 'title', 'genre', 'location', 'description'
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

			delay 1000, =>

				navigation.go_silent "/#{room.url}"

				@check_if_guest()

				m.close()

	on_user_logged: ( data ) =>
		@check_if_guest()

	on_user_unlogged: ( data ) =>
		@check_if_guest()


	check_if_guest: ( ) ->

		###
		If the url path starts with /username, 
		then the user is not a guest
		###
		u = user_controller.get_user()
		guest = location.pathname.indexOf( "/#{u.username}" ) isnt 0

		log "[Room] check_if_guest", guest

		if guest
			app.body.addClass 'guest'
		else
			app.body.removeClass 'guest'		
			appcast.connect()

	destroy: ->
		user_controller.off 'user:logged', @on_user_logged
		user_controller.off 'user:unlogged', @on_user_unlogged

		
		
		