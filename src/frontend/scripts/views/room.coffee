L               = require 'api/loopcast/loopcast'
navigation      = require 'app/controllers/navigation'
Strings         = require 'app/utils/string'
user_controller = require 'app/controllers/user'
notify          = require 'app/controllers/notify'
LoggedView      = require 'app/views/logged_view'

module.exports = class Room extends LoggedView

	constructor: ( @dom ) ->
		super @dom

		@elements = 
			title       : @dom.find '.cover .name'
			genre       : @dom.find '.cover .genres'
			location    : @dom.find '.cover .location'
			cover       : @dom.find '.cover .cover_image'
			description : @dom.find '.chat_header p'

		if Strings.is_empty( @elements.title.html() )
			@elements.title.addClass 'hidden'



	on_views_binded: ( scope ) =>
		log "[Room] #####", scope.main
		super scope
		return if not scope.main
		@modal = view.get_by_dom '#room_modal'
		@modal.on 'input:changed', @on_input_changed
		@modal.on 'submit', @on_modal_submit

		log "[Room] on_view_binded", @is_create_page()
		if @is_create_page()
			@modal.open()
			@dom.addClass 'page_create'
		else
			@on_room_created()

		

	on_input_changed: ( data ) =>
		switch data.name
			when 'title', 'description'
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
		L.rooms.create data, ( error, data ) ->

			if error?

				notify.error error.responseJSON.message

				m.hide_loading()

				return false

			delay 1000, =>

				# appends room_id to body in order to be compatible with 
				# server side rendered template
				hidden = "<input type='hidden' id='room_id' value='#{data._id}'>"
				$( 'body' ).append hidden

				navigation.go_silent "/#{data.info.user}/#{data.info.slug}"

				m.close()

				$( '.create_room_item' ).removeClass 'selected'

				ref.on_room_created( data )

	on_room_created: (data) ->
		log "[Room] on room created"
		@dom.removeClass 'page_create'

		if data
			@dom.find( '.chat_header.v_center' ).html data.about

	on_user_logged: ( data ) =>
		log "[Room] on_user_logged", data
		img = @dom.find '.author_chat_thumb'
		if not img.data( 'original' )?
			img.data( 'original', img[0].src )

		img[0].src = user_controller.data.images.chat_thumb

	on_user_unlogged: ( data ) =>
		

	check_guest: ( ) ->

		###
		If the url path starts with /username, 
		then the user is not a guest
		###
		if @is_guest()
			app.body.addClass 'guest'
		else
			app.body.removeClass 'guest'		
			appcast.connect()

	is_guest: ->
		u = user_controller.data
		guest = location.pathname.indexOf( "/#{u.username}" ) isnt 0

	is_create_page: ( ) ->
		location.pathname is '/rooms/create'

		
		
		