Cloudinary = require 'app/controllers/cloudinary'
transform  = require 'lib/cloudinary/transform'
notify     = require 'app/controllers/notify'
user_controller = require 'app/controllers/user'
LoggedView = require 'app/views/logged_view'
api = require 'app/api/loopcast/loopcast'
happens = require 'happens'
StringUtils = require 'app/utils/string'
navigation = require 'app/controllers/navigation'

module.exports = class Profile extends LoggedView
	elements: null
	form_bio: null
	cover_url: ""
	user_logged: false

	constructor: ( @dom ) ->
		super()
		happens @

		log "[=== PAGE OWNER: #{user_controller.owner_id()} ===]"

		$( '#room_modal' ).data 'modal-close', true

		delay 100, => @emit 'ready'


	on_views_binded: ( scope ) =>
		return unless scope.main
		

		@elements = 
			location         : @dom.find '.profile_bio .location'
			location_input   : @dom.find '.location_input'
			about            : @dom.find '.bio'
			about_input      : @dom.find '.bio_input'
			name             : view.get_by_dom @dom.find( '.cover h1.name' )
			occupation       : view.get_by_dom @dom.find( '.cover h3.type' )
			genre            : view.get_by_dom @dom.find( '.cover .genres' )
			links            : view.get_by_dom @dom.find( '.social_links'  )

		# Check the information of the owner of the page
		@check_informations()

		@modal = view.get_by_dom $( '#room_modal' )

		super scope



	manage_form: ->
		

		@form_bio = @dom.find '.profile_form'
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


		

	on_user_logged: ( @user_data ) =>
		if @user_logged or not @elements?
			return 

		@user_logged = true

		log "[Profile] on_user_logged", @user_data


		super @user_data

		@dom.addClass 'user_logged'

		@check_visibility_editables()
		@check_informations()

		user_controller.check_guest_owner()
		if not user_controller.is_owner
			log "[Profile] returning because the user is not owner"
			return

		@manage_form()

		# Listen to name, occupation and genres changes
		@elements.name.on 'changed', @on_name_changed
		@elements.genre.on 'changed', @on_genre_changed
		@elements.occupation.on 'changed', @on_occupation_changed

		# Listen to images upload events
		@change_cover_uploader = view.get_by_dom @dom.find( '.change_cover' )
		@change_cover_uploader.on 'completed', @on_cover_uploaded
			
		@change_picture_uploader = view.get_by_dom @dom.find( '.profile_image' )
		@change_picture_uploader.on 'completed', @on_avatar_uploaded


	on_name_changed: ( new_name ) =>
		return if new_name is user_controller.data.name

		notify.info "You changed your name"
		log "[Profile] on_name_changed", new_name
		if new_name.length > 0

			ref = @
			@send_to_server name: new_name, (response) ->
				# log "on_name_changed response", response

				navigation.go_silent "/" + response[ 'info.username' ]
				user_controller.name_updated 
					username: response[ 'info.username' ]
					name: response[ 'info.name' ]

		else
			# Set the name back
			@elements.name.set_text user_controller.data.name

	on_genre_changed: ( data ) =>
		log "[Genre] changed", data
		@send_to_server genres: data

	on_occupation_changed: ( data ) =>
		log "[occupation] changed", data
		return if data.default_state
		@send_to_server occupation: data.value
		
	on_cover_uploaded: (data) =>
		log "[Cover uploader]", data.result.secure_url, data

		cover = transform.cover data.result.secure_url

		@dom.find( '.cover_image' ).css
			'background-image': "url(#{cover})"

		@send_to_server cover: data.result.secure_url


	on_avatar_uploaded: (data) =>
		user_controller.data.avatar = data.result.secure_url
		user_controller.create_images()

		avatar = user_controller.data.images.avatar
		@dom.find( 'img' ).attr 'src', avatar

		@send_to_server avatar: data.result.secure_url

	check_visibility_editables: =>
		user_controller.check_guest_owner()
		if user_controller.is_owner

			@elements.occupation.dom.show()
			@elements.genre.dom.show()
		else

			if @elements.occupation.default_state
				@elements.occupation.dom.hide()

			if @elements.genre.default_state
				@elements.genre.dom.hide()


	on_user_unlogged: (@user_data) =>
		# log "[Profile] on_user_unlogged"
		super @user_data
		@dom.removeClass( 'user_logged' )

		@change_cover_uploader?.off 'completed'
		@change_picture_uploader?.off 'completed'
		delay 1, => @check_visibility_editables()


	# Open the write/edit mode
	write_mode : ->
		app.body.addClass 'write_mode'
	
	
	save_data : ->
		
		# Form submitted.

		# Get the values from the form
		@elements.links.close_read_mode()

		data = 
			location : @elements.location_input.val()
			about    : StringUtils.line_breaks_to_br @elements.about_input.val()
			social   : @elements.links.get_current_value()

		# Update the values on the labels
		@elements.location.html data.location
		@elements.about.html data.about

		# Save data
		@send_to_server data

		# - close the write/edit mode and switch to read only mode
		app.body.removeClass 'write_mode'

		# Check if some of the information is now empty
		@check_informations()


	html_to_textarea : ( str ) ->
		to_find = "<br />"
		to_replace = "\n"
		re = new RegExp to_find, 'g'

		str = str.replace re, to_replace

		to_find = "<br>"
		to_replace = "\n"
		re = new RegExp to_find, 'g'
		str = str.replace re, to_replace

		return str

	check_informations: ->
		l = @elements.location.html().length
		b = @elements.about.html().length

		# log "[Profile] check_informations", @elements.location.html(), @elements.about.html()
		if l > 0 or b > 0
			@dom.removeClass 'no_information_yet'
		else
			@dom.addClass 'no_information_yet'
		
		if b > 0
			str = @html_to_textarea @elements.about.html()
			@elements.about_input.val str




	send_to_server: ( data, callback = -> )->
		log "[Profile] saving", data

		api.user.edit data, ( error, response ) =>

			if error
				log "---> Error Profile edit user", error.statusText
				return

			log "[Profile] fields updated", response
			user_controller.write_to_session()

			callback response


	destroy: ->
		super()

		if @modal
			view.destroy_view @modal
			
		if user_controller.is_owner
			@change_cover_uploader.off 'completed', @on_cover_uploaded
			@change_picture_uploader.off 'completed', @on_avatar_uploaded

