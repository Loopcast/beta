settings  	= require 'app/utils/settings'
happens  	= require 'happens'
ways    	= require 'ways'
ways.use require 'ways-browser'

class Navigation

	instance = null
	

	constructor: ->

		if Navigation.instance
			console.error "You can't instantiate this Navigation twice"	

			return

		Navigation.instance = @
		@content_selector = '#content .inner_content'
		@content_div = $ @content_selector

		happens @

		# this way we can call navigation from successful pop up
		window.ways = ways		



		
	
		# routing
		ways '*', @url_changed



		# don't need to init since the first page is already on DOM
		do ways.init

	url_changed: ( req ) =>

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

				@emit 'after_render'

	##
	# Navigates to a given URL using Html 5 history API
	##
	go: ( url ) ->

		# don't hijack login actions
		if req.url.indexOf '/login' is 0 then return true

		ways.go url

		return false

	##
	# Looks for internal links and bind then to client side navigation
	# as in: html History api
	##
	bind: ( scope = 'body' ) ->

		$( scope ).find( 'a' ).each ( index, item ) ->

			$item = $ item
			href = $item.attr( 'href' )

			if !href? then return 

			# if the link has http and the domain is different
			if href.indexOf( 'http' ) >= 0 and href.indexOf( document.domain ) < 0 
				return 

			if href.indexOf( "#" ) is 0
				$item.click -> return false

			else if href.indexOf( "javascript" ) is 0 or href.indexOf( "tel:" ) is 0
				return true
			else
				$item.click -> 
					return Navigation.instance.go $( @ ).attr 'href'


# will always export the same instance
module.exports = new Navigation