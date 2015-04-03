L           = require 'api/loopcast/loopcast'
navigation  = require 'app/controllers/navigation'
Strings     = require 'app/utils/string'
user_controller = require 'app/controllers/user'
notify = require 'app/controllers/notify'

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

		if @is_create_page()
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

		ref = @
		L.rooms.create data, ( data, d ) ->
			json = data.responseJSON
			log "[Room] create callback", data, json, d
			if json.error?
				notify.error json.message

				m.hide_loading()

				return false

			# delay 1000, =>

			# 	navigation.go_silent "/#{room.url}"

			# 	ref.check_guest()

			# 	m.close()

			# 	$( '.create_room_item' ).removeClass 'selected'

	on_user_logged: ( data ) =>
		@check_guest()

	on_user_unlogged: ( data ) =>
		@check_guest()


	check_guest: ( ) ->

		###
		If the url path starts with /username, 
		then the user is not a guest
		###
		if @is_guest()
			app.body.addClass 'guest'
		else
			app.body.removeClass 'guest'		
			# appcast.connect()

	is_guest: ( ) ->
		u = user_controller.get_user()
		guest = location.pathname.indexOf( "/#{u.username}" ) isnt 0

	is_create_page: ( ) ->
		location.pathname is '/rooms/create'

	destroy: ->
		user_controller.off 'user:logged', @on_user_logged
		user_controller.off 'user:unlogged', @on_user_unlogged

		
		
		