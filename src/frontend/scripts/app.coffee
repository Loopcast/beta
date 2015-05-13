require './globals'
require './vendors'

views           = require './controllers/views'
navigation      = require './controllers/navigation'
appcast         = require './controllers/appcast'
cloudinary      = require './controllers/cloudinary'
# motion   = require 'app/controllers/motion'




class App

	# link to window
	window: null

	# link to utils/settings
	settings: null

	# link to controller/local_connection
	local: null

	# link to controller/session
	session: null

	main_view_binded_counter: 0

	constructor: ->
		happens @

	start: ->
		
		@local   = require 'app/controllers/local_connection'
		@session = require 'app/controllers/storage'
		@window  = require 'app/controllers/window'
		@user    = require './controllers/user'

		@body    = $ 'body'
		
		# u = Session.get( 'user', false )
		# log "[Session] user", u
		
		@settings = require 'app/utils/settings'
		@settings.bind @body

		# Controllers binding
		first_render = true

		navigation.on 'before_load', =>
			views.unbind '#content'

			if navigation.main_refresh() and settings.theme is 'desktop'
				@emit 'loading:show'

		navigation.on 'after_render', =>

			if not first_render
				views.bind '#content'

			navigation.bind '#content'
			@user.check_guest_owner()
	
			first_render = false

		views.bind 'body'
		navigation.bind()

	on_views_binded: ( scope ) =>
		if not scope.main
			return 

		@main_view_binded_counter++

		if window.opener? and @main_view_binded_counter > 1
			return

		# Get the player
		@player = view.get_by_dom '#player'


		# Check if some view is requesting the preload
		view_preloading = $( scope.scope ).find( '.request_preloading' )
		v = views.get_by_dom view_preloading
		# If some view is preloading, wait for its ready event
		if view_preloading.length > 0 and v
			v.once 'ready', => 
				if navigation.main_refresh()
					@emit 'loading:hide'

		# Otherwise just hide the loading screen
		else
			if navigation.main_refresh()
				@emit 'loading:hide'

	
	# User Proxies
	login : ( user_data ) -> 
		log "--------> login called from outside", user_data

		if @settings.after_login_url.length > 0
			url = @settings.after_login_url
			@settings.after_login_url = ""
		else
			url = "/#{user_data.username}"
			
		navigation.go url
		@user.login user_data

	logout: -> 
		@user.logout =>
			@settings.after_logout_url = "/"
			log "[App] logout callback. next url", @settings.after_logout_url
			if @settings.after_logout_url.length > 0
				url = @settings.after_logout_url
				@settings.after_logout_url = ""
				navigation.go url

	

		
app = new App

$ -> app.start()

module.exports = window.app = app