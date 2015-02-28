settings  	= require 'app/utils/settings'
happens  	= require 'happens'
ways    	= require 'ways'
ways.use require 'ways-browser'
url_parser = require 'app/utils/url_parser'

class Navigation

	instance = null
	first_loading: on

	constructor: ->

		if Navigation.instance
			console.error "You can't instantiate this Navigation twice"	

			return

		Navigation.instance = @
		@content_selector = '#content .inner_content'
		@content_div = $ @content_selector

		happens @
	
		# export to window
		window.ways = ways;
		
		# routing
		ways '*', @url_changed


		# For the first screen, emit the event after_render.
		# if, in the meantime, the navigation goes to another url
		# we won't emit this first event.
		delay 200, =>
			if @first_loading then @emit 'after_render'


	url_changed: ( req ) =>


		log "url_changed", req.url

		# ie hack for hash urls
		req.url = req.url.replace( "/#", '' )

		# log " controllers/navigation/url_changed:: #{req.url}"
		# TODO: 
		#  - don't reload if the content is already loaded
		#  - implement transitions out
		#  - implement transition  in 

		div = $( '<div>' )

		@emit 'before_load'

		div.load req.url, =>

			@emit 'on_load'

			if app.body.scrollTop() > 0
				app.body.animate scrollTop: 0


			@emit 'before_destroy'		

			delay 400, =>			

				new_content = div.find( @content_selector ).children()
				
				@content_div = $ @content_selector

				# Remove old content
				@content_div.children().remove()

				# populate with the loaded content
				@content_div.append new_content
				delay 10, =>
					log "[Navigation] after_render", req.url
					@emit 'after_render'

	##
	# Navigates to a given URL using Html 5 history API
	##
	go: ( url ) ->

		# If it's a popup, bypass ways and seamless navigation
		if window.opener?
			return true

		@first_loading = off

		ways.go url

		return false

	go_silent: ( url, title ) ->
		if title?
			ways.go.silent url, title
		else
			ways.go.silent url
	##
	# Looks for internal links and bind then to client side navigation
	# as in: html History api
	##
	bind: ( scope = 'body' ) ->

		$( scope ).find( 'a' ).each ( index, item ) ->

			$item = $ item
			href = $item.attr( 'href' )

			if !href?
				log "[Navigation] return 1"
				return 

			# if the link has http and the domain is different
			if href.indexOf( 'http' ) >= 0 and href.indexOf( document.domain ) < 0 
				log "[Navigation] return 2", href
				return 

			if href.indexOf( "#" ) is 0
				$item.click -> 
					log "[Navigation] return 3", href
					return false

			else if href.indexOf( "javascript" ) is 0 or href.indexOf( "tel:" ) is 0
				log "[Navigation] return 4", href
				return true
			else
				$item.click ->
					href = $( @ ).attr 'href'
					log "[Navigation] return 5", href

					a = url_parser.get_pathname href
					b = url_parser.get_pathname location.pathname

					return false if a is b

					log "[Navigation] return LAST"
					return Navigation.instance.go href


# will always export the same instance
module.exports = new Navigation