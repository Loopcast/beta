require './globals'
require './vendors'

views           = require './controllers/views'
navigation      = require './controllers/navigation'
appcast         = require './controllers/appcast'
cloudinary      = require './controllers/cloudinary'
GUI             = require './controllers/gui'
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

	constructor: ->
		happens @

	start: ->
		
		@local   = require 'app/controllers/local_connection'
		@session = require 'app/controllers/storage'
		@window  = require 'app/controllers/window'
		@user    = require './controllers/user'
		@gui     = new GUI

		@body    = $ 'body'
		
		# u = Session.get( 'user', false )
		# log "[Session] user", u
		
		@settings = require 'app/utils/settings'
		@settings.bind @body

		# Controllers binding
		first_render = true

		views.on 'binded', @on_views_binded

		navigation.on 'before_destroy', =>
			@emit 'loading:show'
			views.unbind '#content'

		navigation.on 'after_render', => 

			if not first_render
				views.bind '#content'

			navigation.bind '#content'
	
			first_render = false

		views.bind 'body'
		navigation.bind()

	on_views_binded: ( scope ) =>
		return if not scope.main

		# Check if some view is requesting the preload
		view_preloading = $( scope.scope ).find( '.request_preloading' )

		# If some view is preloading, wait for its ready event
		if view_preloading.length > 0
			v = views.get_by_dom view_preloading
			v.once 'ready', => @emit 'loading:hide'

		# Otherwise just hide the loading screen
		else
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

	logout: -> @user.logout()

	

		
app = new App

$ -> app.start()

module.exports = window.app = app