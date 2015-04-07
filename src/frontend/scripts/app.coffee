require './globals'
require './vendors'

views           = require './controllers/views'
navigation      = require './controllers/navigation'
appcast         = require './controllers/appcast'
user_controller = require './controllers/user'
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

	constructor: -> 	

		happens @

		# are we using this?
		@on 'ready', @after_render

	start: ->
		
		@local   = require 'app/controllers/local_connection'
		@session = require 'app/controllers/storage'
		@window  = require 'app/controllers/window'

		@body    = $ 'body'

		
		# u = Session.get( 'user', false )
		# log "[Session] user", u
		
		@settings = require 'app/utils/settings'
		@settings.bind @body

		# Controllers binding
		do views.bind
		do navigation.bind

		# when the new are is rendered, do the same with the new content

		navigation.on 'before_destroy', =>
			views.unbind '#content'

		navigation.on 'after_render', => 
			views.bind       '#content'
			navigation.bind '#content'
			do user_controller.check_user


			
	
	# User Proxies
	login : ( user ) -> 
		log "--------> login called from outside", user

		if @settings.after_login_url.length > 0
			url = @settings.after_login_url
			@settings.after_login_url = ""
		else
			url = "/#{user.username}"
			
		navigation.go url
		user_controller.login user

	logout: -> 
		log "[logged out]", user
		
		user_controller.logout()


	###
	# After the views have been rendered
	###
	after_render: ( ) =>
		log "after_render"
		# Hide the loading
		delay 10, => @body.addClass "loaded"

		
app = new App

$ -> app.start()

module.exports = window.app = app