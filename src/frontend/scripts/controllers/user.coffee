transform = require 'app/utils/images/transform'
happens   = require 'happens'
navigation = require 'app/controllers/navigation'
notify = require 'app/controllers/notify'

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
			
			app.session.delete 'user'

			navigation.go '/'

			notify.info "You've successufully logged out."

			callback?()
	
	login: ( user ) ->

		# Add images urls

		if not user.avatar?
			log "[User Controller] user.avatar is undefined. Setting default."
			user.avatar = this.USER_DEFAULT_AVATAR
		
		
		user.images =
			top_bar: transform.top_bar user.avatar
			avatar: transform.avatar user.avatar

		@set_user user

		app.body.addClass "logged"

		@emit 'user:logged', @get_user()

		log "[User Controller] login", @get_user()

		notify.info "You've successufully logged in."

	check_user: -> 
		log "[User Controller] check_user", @is_logged()
		if @is_logged()
			@login @get_user()
		else
			@logout()

	is_logged: -> @get_user()

	get_user: -> app.session.get 'user', false

	set_user: (user) -> app.session.set 'user', user