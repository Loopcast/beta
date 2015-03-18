transform = require 'app/utils/images/transform'
happens   = require 'happens'
navigation = require 'app/controllers/navigation'

module.exports = happens
	
	USER_DEFAULT_AVATAR: "/images/profile-1.jpg"


	logout: ( callback = -> ) ->
		
		if not @is_logged() then return callback error: code: 'node_logged'

		log "[User] trying to logout..."

		$.post '/api/v1/logout', {}, (data) =>
			log "[User] logout ~ success", data

			@emit 'user:unlogged'

			app.body.removeClass "logged"

			log "[User Controller] deleting user variable"
			delete loopcast.user

			navigation.go '/'

			callback?()
	
	login: ( user ) ->

		loopcast.user = user

		log "login", user
		# Add images urls

		if not user.avatar?
			user.avatar = this.USER_DEFAULT_AVATAR
		
			
		loopcast.user.images =
			top_bar: transform.top_bar user.avatar
			avatar: transform.avatar user.avatar

		app.body.addClass "logged"

		@emit 'user:logged', @get_user()

		log "[User Controller] login", @get_user()

	check_user: -> 
		log '[User Controller] check_user', loopcast
		if @is_logged()
			@login @get_user()
		else
			@logout()

	is_logged: -> @get_user()?

	get_user: -> loopcast.user

	set_user: (user) -> loopcast.user = user