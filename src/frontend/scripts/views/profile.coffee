module.exports = class Profile 
	constructor: ( @dom ) ->

		@elements = 
			profile_picture: @dom.find( '.profile_image img' )
			cover_picture: @dom.find( '.cover_image' )
			location: @dom.find( '.location' )
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

		@fake_user = 
			profile_picture: "/images/profile_big.png"
			cover_picture: "/images/homepage_2.jpg"
			location: "London - UK"
			bio: "Thomas Amundsen from Oslo, now based in London has from an early age lots of musical influences, experimenting from acoustic instruments to electronic music production and DJing.<br/><br/>He released his debut EP “I Feel” on Fusion recordings, sub-label of Dj Center Records, and has since released frequently on labels such as; Dobara, Susurrous Music, Incognitus Recordings, Koolwaters and gained support from the likes of Amine Edge, Stacey Pullen, Detlef, Slam, Marc Vedo, Loverdose, Ashley Wild, Jobe and many more"
			links: [
				{type:"spotify", url:"http://spotify.com"},
				{type:"soundcloud", url:"http://soundcloud.com"},
				{type:"facebook", url:"http://facebook.com"}
			]


		@form_bio = @dom.find( '.profile_form' )
		@form_bio.on 'submit', (e) -> e.preventDefault()
		@form_bio.find( 'input' ).keyup (e) =>
			if e.keyCode is 13
				@read_mode()


		@update_dom_from_user()

		ref = @

		@dom.find( '[data-profile]' ).on 'click', ->

			value = $(@).data 'profile'

			switch value
				when 'set-write-mode'
					do ref.write_mode
				when 'set-read-mode'
					do ref.read_mode


	write_mode : ->
		log "[Profile] set write mode"
		app.body.addClass 'write_mode'

	read_mode : ->
		# Trying to save 
		@fetch_user_from_dom()

		@update_dom_from_user()

		log "[Profile] set read mode"
		app.body.removeClass 'write_mode'

	fetch_user_from_dom: ->
		@fake_user.location = @elements.location_input.val()
		@fake_user.bio = @elements.bio_input.val()

		@fake_user.links = []
		for l, i in @elements.links_input
			@fake_user.links.push
				type: l.type
				url: l.el.val()


	update_dom_from_user : ->
		e = @elements
		d = @fake_user

		e.profile_picture.css 'background-image', d.profile_picture
		e.cover_picture.css 'background-image', d.cover_picture

		e.location.html d.location
		e.location_input.val d.location

		e.bio.html d.bio
		e.bio_input.val @html_to_textarea( d.bio )

		log "SAVING", d.links, e.links
		for link, i in d.links
			log 'link', link, 'i', i
			e.links[ i ].el.attr 'href', link.url
			e.links_input[ i ].el.val link.url

	html_to_textarea : ( str ) ->
		to_find = "<br/>"
		to_replace = "\n"
		re = new RegExp(to_find, 'g');

		return str.replace(re, to_replace);