happens = require 'happens'

module.exports = happens
	logout: ( callback ) ->
		
		return unless @is_logged()

		log "[User] trying to logout..."

		$.post '/logout', {}, (data) =>
			log "[User] logout ~ success", data

			@emit 'user:unlogged'

			app.body.removeClass "logged"

			log "[User Controller] deleting user variable"
			delete loopcast.user

			callback?()
	
	login: ( user ) ->
		# Register the user as a global variable
		loopcast.user = user
		app.body.addClass "logged"
		@emit 'user:logged', loopcast.user

		log "[User Controller] login", loopcast.user

	check_user: -> 
		if @is_logged()
			@login loopcast.user
		else
			@logout()

	is_logged: -> loopcast.user?