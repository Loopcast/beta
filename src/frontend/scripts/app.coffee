is_login_page = require 'app/utils/is_login_page'

require './globals'
require './vendors'


if not is_login_page()
# motion   = require 'app/controllers/motion'

	views           = require './controllers/views'
	navigation      = require './controllers/navigation'
	appcast         = require './controllers/appcast'
	cloudinary      = require './controllers/cloudinary'



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
		@socket  = require 'app/controllers/socket'
		@user    = require './controllers/user'

		@body    = $ 'body'
		
		# u = Session.get( 'user', false )
		# log "[Session] user", u
		
		@settings = require 'app/utils/settings'
		@settings.bind @body

		navigation.on 'before_load' , @before_load
		navigation.on 'after_render', @after_render

		views.on 'binded', @on_views_binded

		views.bind 'body'

		if @settings.browser_unsupported
			location.href = "/oldie"

	before_load: =>
		if navigation.main_refresh()
			@emit 'loading:show'

		views.unbind navigation.content_selector

	after_render: =>
		views.bind '#content'
		@user.check_guest_owner()




	on_views_binded: ( scope ) =>
		if not scope.main
			return 

		@player = view.get_by_dom '#player'

		if $('.request_preloading').length > 0
			v = view.get_by_dom '.request_preloading'

			if v
				v.on 'ready', => 
					v.off 'ready'
					v = null
					@emit 'loading:hide'
			else
				@emit 'loading:hide'

		else
			@emit 'loading:hide'


	
	# User Proxies
	login : ( user_data ) -> 
		log "--------> login called from outside", user_data

		if @settings.after_login_url.length > 0
			url = @settings.after_login_url
			@settings.after_login_url = ""
		else if navigation.prev_url.length > 0 and navigation.prev_url isnt "/"
			url = navigation.prev_url
		else
			url = "/#{user_data.username}"
		

		if @settings.action? and @settings.action.type is 'follow'
			@user.follow @settings.action.user_id

			@settings.action = null


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

	
if is_login_page()
	
	login = require 'app/controllers/login'
	$ -> login.start()

else
	app = new App

	$ -> app.start()

	module.exports = window.app = app