settings  	= require 'app/utils/settings'
happens  	= require 'happens'
# ways    	= require 'ways'
# ways.use require 'ways-browser'
url_parser = require 'app/utils/url_parser'
page = require 'page'

class Navigation

	instance = null
	first_loading: on
	first_url_change: true
	first_same_path: true

	constructor: ->

		if Navigation.instance
			console.error "You can't instantiate this Navigation twice"	

			return

		Navigation.instance = @
		@content_selector = '#content .inner_content'
		@content_div = $ @content_selector

		happens @
		
		# routing
		page '*', @url_changed
		page();
		# ways '*', @url_changed


		# For the first screen, emit the event after_render.
		# if, in the meantime, the navigation goes to another url
		# we won't emit this first event.
		delay 200, =>
			if @first_loading then @emit 'after_render'


	url_changed: ( req ) =>

		if @first_url_change
			@first_url_change = off
			return

		if req.path is location.pathname
			if @first_same_path
				@first_same_path = false
				log "[Navigation] return same path "
				# return

		# ie hack for hash urls
		req.url = req.path.replace( "/#", '' )

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
				delay 10, => @emit 'after_render'

	##
	# Navigates to a given URL using Html 5 history API
	##
	go: ( url ) ->

		# If it's a popup, bypass ways and seamless navigation
		if window.opener?
			location.href = url
			return true

		@first_loading = off

		log "[Navigates] go", url
		page url
		# ways.go url

		return false

	go_silent: ( url, title ) ->
		page.replace url, null, null, false
		
	##
	# Looks for internal links and bind then to client side navigation
	# as in: html History api
	##
	bind: ( scope = 'body' ) ->

		$( scope ).find( 'a' ).on 'click', ->
			$item = $ @

			href = $item.attr 'href'

			if !href? then return false

			# if the link has http and the domain is different
			if href.indexOf( 'http' ) >= 0 and href.indexOf( document.domain ) < 0 
				return true

			if href.indexOf( "javascript" ) is 0 or href.indexOf( "tel:" ) is 0
				return true

			if $item.attr( 'target' )?
				return true

			if href.indexOf( "#" ) is 0
				return false

			# Check if the url is the same
			a = url_parser.get_pathname href
			b = url_parser.get_pathname location.pathname
			if a is b
				return false 

			return Navigation.instance.go href


# will always export the same instance
module.exports = new Navigation