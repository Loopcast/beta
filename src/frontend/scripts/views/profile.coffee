Cloudinary = require 'app/controllers/cloudinary'
transform  = require 'app/utils/images/transform'
notify     = require 'app/controllers/notify'
user_controller = require 'app/controllers/user'
LoggedView = require 'app/views/logged_view'
api = require 'app/api/loopcast/loopcast'
happens = require 'happens'

module.exports = class Profile extends LoggedView
	elements: null
	form_bio: null

	constructor: ( @dom ) ->
		super()
		happens @

		log "[=== PAGE OWNER: #{owner_id} ===]"

		app.gui.watch profile_info

		@elements = 
			avatar: @dom.find( '.profile_image img' )
			cover_picture: @dom.find( '.cover_image' )
			location: @dom.find( '.profile_bio .location' )
			location_input: @dom.find( '.location_input' )
			about: @dom.find( '.bio' )
			about_input: @dom.find( '.bio_input' )
			links: [
				{type:"spotify", el:@dom.find( '.spotify_link' )},
				{type:"soundcloud", el:@dom.find( '.soundcloud_link' )},
				{type:"facebook", el:@dom.find( '.facebook_link' )}
			]
			links_input: [
				{type:"spotify", el:@dom.find( '.spotify_input' )},
				{type:"soundcloud", el:@dom.find( '.soundcloud_input' )},
				{type:"facebook", el:@dom.find( '.facebook_input' )}
			]
			occupation_input: null
			genre_input: null

		@elements.avatar.attr 'src', transform.avatar( profile_info.avatar )


		@form_bio = @dom.find( '.profile_form' )
		@form_bio.on 'submit', (e) -> e.preventDefault()
		@form_bio.find( 'input' ).keyup (e) =>
			if e.keyCode is 13
				@save_data()

		ref = @

		@dom.find( '[data-profile]' ).on 'click', ->

			value = $(@).data 'profile'

			switch value
				when 'set-write-mode'
					do ref.write_mode
				when 'set-read-mode'
					do ref.save_data


		$( '#room_modal' ).data( 'modal-close', true )

		# Check the information of the owner of the page
		@check_informations()

		delay 100, => 
			@emit 'ready'

	on_views_binded: (scope) =>
		return if not scope.main

		@user_data = profile_info
		@update_dom_from_user_data()

		o = view.get_by_dom @dom.find( '.cover h3.type' )
		g = view.get_by_dom @dom.find( '.cover .genres' )
		l = view.get_by_dom @dom.find( '.social_links' )

		if o and g
			@elements.occupation_input = o
			@elements.genre_input = g
			@elements.links_input = l
		else
			console.error "[Profile] couldn't find occupation and genres component."



		super scope
		


	on_user_logged: ( @user_data ) =>

		log "[Profile] on_user_logged"

		super @user_data

		@dom.addClass 'user_logged'

		@check_visibility_editables()

		if not user_controller.is_owner
			return

		# Listen to images upload events
		@change_cover_uploader = view.get_by_dom @dom.find( '.change_cover' )

		if not @change_cover_uploader
			return

		@change_cover_uploader.on 'completed', (data) =>

			@user_data.cover_picture = data.result.url

			@dom.find( '.cover_image' ).css
				'background-image': "url(#{data.result.url})"

		@change_picture_uploader = view.get_by_dom @dom.find( '.profile_image' )
		@change_picture_uploader.on 'completed', (data) =>

			user_controller.data.avatar = data.result.url
			@user_data = user_controller.normalize_data()

			url = @user_data.images.avatar

			@dom.find( 'img' ).attr 'src', url

		@editables = []
		@editables.push view.get_by_dom( '.cover h1.name' )
		@editables.push view.get_by_dom( '.cover h3.type' )
		@editables.push view.get_by_dom( '.cover .genres' )
		@editables.push view.get_by_dom( '.social_links' )

		


	check_visibility_editables: =>

		if user_controller.is_owner

			@elements.occupation_input.dom.show()
			@elements.genre_input.dom.show()
		else

			if @elements.occupation_input.default_state
				@elements.occupation_input.dom.hide()

			log "check_visibility_editables", @elements.genre_input.default_state
			if @elements.genre_input.default_state
				@elements.genre_input.dom.hide()

			# @elements.occupation_input
			# @elements.genre_input


	on_user_unlogged: =>
		log "[Profile] on_user_unlogged"
		super()
		@dom.removeClass( 'user_logged' )

		@change_cover_uploader?.off 'completed'
		@change_picture_uploader?.off 'completed'
		delay 1, => @check_visibility_editables()


	# Open the write/edit mode
	write_mode : ->
		app.body.addClass 'write_mode'
	
	
	save_data : ->
		# - Update the user_data from the inputs

		for item in @editables
			item.close_read_mode()

		@update_user_data_from_dom()

		# - Update the dom (labels and inputs) from the user_data
		# 	This action is mostly done for updating labels (inputs are already updated)
		@update_dom_from_user_data()

		@check_informations()

		# - TODO: Send the data to the backend
		@send_to_server()

		# - close the write/edit mode and switch to read only mode
		app.body.removeClass 'write_mode'



	update_user_data_from_dom: ->

		# - TODO: Update the images
		log "[Profile] update_user_data_from_dom"
		@user_data.location = @elements.location_input.val()
		@user_data.about = @elements.about_input.val()

		@user_data.occupation = @elements.occupation_input.get_current_value()
		@user_data.genres = @elements.genre_input.get_current_value()

		@user_data.social = @elements.links_input.get_current_value()


	update_dom_from_user_data : ->

		log "[Profile] update_dom_from_user_data"
		e = @elements
		d = @user_data

		e.avatar.css 'background-image', d.avatar
		e.cover_picture.css 'background-image', d.cover_picture

		if d.location
			e.location.html d.location
			e.location_input.val d.location

		if d.about
			e.about.html d.about
			e.about_input.val @html_to_textarea( d.about )


	html_to_textarea : ( str ) ->
		to_find = "<br/>"
		to_replace = "\n"
		re = new RegExp to_find, 'g'

		return str.replace re, to_replace

	check_informations: ->
		l = @elements.location.html().length
		b = @elements.about.html().length

		# log "[Profile] check_informations", l, b
		# log "---> location", @elements.location.html(), @elements.location.html().length
		# log "---> location", @elements.bio.html(), @elements.bio.html().length
		if l > 0 or b > 0
			@dom.removeClass 'no_information_yet'
		else
			@dom.addClass 'no_information_yet'




	send_to_server: ->
		log "[Profile] saving", @user_data

		# return
		# user_id
		# name: String
		# occupation: String
		# genres
		# about: String
		# location: String
		# social: Array
		# avatar: String
		# cover: String


		api.user.edit @user_data, ( error, response ) =>

			log "[Profile] fields updated", response.custom_attributes
			if error
				log "---> Error Profile edit user", error.statusText
				return

			user_controller.write_to_session()
