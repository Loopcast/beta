transform = require 'app/utils/images/transform'
happens   = require 'happens'
navigation = require 'app/controllers/navigation'

module.exports = happens
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

		# Add images urls
		loopcast.user.images =
			top_bar: transform.top_bar user.avatar
			avatar: transform.avatar user.avatar

		app.body.addClass "logged"

		@emit 'user:logged', @get_user()

		log "[User Controller] login", @get_user()

	check_user: -> 
		if @is_logged()
			@login @get_user()
		else
			@logout()

	is_logged: -> @get_user()?

	get_user: -> loopcast.user

	set_user: (user) -> loopcast.user = user