###
 user_data :
 	profile_picture: "/images/profile_big.png"
 	cover_picture: "/images/homepage_2.jpg"
 	location: "London - UK"
 	bio: "Thomas Amundsen from Oslo, now based in London has from an early age lots of musical influences, experimenting from acoustic instruments to electronic music production and DJing.<br/><br/>He released his debut EP “I Feel” on Fusion recordings, sub-label of Dj Center Records, and has since released frequently on labels such as; Dobara, Susurrous Music, Incognitus Recordings, Koolwaters and gained support from the likes of Amine Edge, Stacey Pullen, Detlef, Slam, Marc Vedo, Loverdose, Ashley Wild, Jobe and many more"
 	links: [
 		{type:"spotify", url:"http://spotify.com"},
 		{type:"soundcloud", url:"http://soundcloud.com"},
 		{type:"facebook", url:"http://facebook.com"}
 	]
###
Cloudinary = require 'app/controllers/cloudinary'
transform  = require 'app/utils/images/transform'
notify     = require 'app/controllers/notify'
user_controller = require 'app/controllers/user'
LoggedView = require 'app/views/logged_view'
api = require 'app/api/loopcast/loopcast'

module.exports = class Profile extends LoggedView
	elements: null
	form_bio: null

	constructor: ( @dom ) ->
		super()

		log "[=== PAGE OWNER: #{owner_id} ===]"

		app.gui.watch profile_info

		@elements = 
			profile_picture: @dom.find( '.profile_image img' )
			cover_picture: @dom.find( '.cover_image' )
			location: @dom.find( '.profile_bio .location' )
			location_input: @dom.find( '.location_input' )
			bio: @dom.find( '.bio' )
			bio_input: @dom.find( '.bio_input' )
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

	on_user_logged: ( @user_data ) =>

		super @user_data

		@dom.addClass 'user_logged'

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

			@user_data.profile_picture = data.result.url

			url = transform.avatar data.result.url

			@dom.find( 'img' ).attr 'src', url

		@editables = []
		@editables.push view.get_by_dom( '.cover h1.name' )
		@editables.push view.get_by_dom( '.cover h3.type' )
		@editables.push view.get_by_dom( '.cover .genres' )


	on_user_unlogged: =>
		super()
		@dom.removeClass( 'user_logged' )


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

		@user_data.location = @elements.location_input.val()
		@user_data.bio = @elements.bio_input.val()

		@user_data.links = []
		for l, i in @elements.links_input
			@user_data.links.push
				type: l.type
				url: l.el.val()


	update_dom_from_user_data : ->

		e = @elements
		d = @user_data

		e.profile_picture.css 'background-image', d.profile_picture
		e.cover_picture.css 'background-image', d.cover_picture

		e.location.html d.location
		e.location_input.val d.location

		e.bio.html d.bio
		e.bio_input.val @html_to_textarea( d.bio )

		for link, i in d.links
			e.links[ i ].el.attr 'href', link.url
			e.links_input[ i ].el.val link.url

	html_to_textarea : ( str ) ->
		to_find = "<br/>"
		to_replace = "\n"
		re = new RegExp to_find, 'g'

		return str.replace re, to_replace

	check_informations: ->
		l = @elements.location.html().length
		b = @elements.bio.html().length

		# log "[Profile] check_informations", l, b
		# log "---> location", @elements.location.html(), @elements.location.html().length
		# log "---> location", @elements.bio.html(), @elements.bio.html().length
		if l > 0 or b > 0
			@dom.removeClass 'no_information_yet'
		else
			@dom.addClass 'no_information_yet'




	send_to_server: ->
		log "[Profile] saving", @user_data

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
			log "[Profile] user edit response", error, response
			if error
				log "---> Error Profile edit user", error.statusText
