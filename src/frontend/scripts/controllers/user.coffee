happens = require 'happens'

user = happens
	logout: ( callback ) ->
		@emit 'user:logged_out'
		do callback
	
	login: ( callback ) ->
		user = 
			username : "Stefano Ortisi"
			thumb    : "/images/profile.jpg"
			permalink: "/profile/stefanoortisi"

		app.body.addClass "logged"
		@emit 'user:logged', user

module.exports = window.user_controller = user