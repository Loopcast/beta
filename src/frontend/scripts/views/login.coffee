Navigation = require 'app/controllers/navigation'

module.exports = class Login
	constructor: ( @dom ) ->

		unless window.opener?
			app.body.removeClass "login_page"
			Navigation.go '/'

		$('#player').hide()
		
		@username = @dom.find( '.username' )
		@password = @dom.find( '.password' )

		@dom.find( '.facebook' ).on 'click', @_facebook_login
		@dom.find( '.soundcloud' ).on 'click', @_soundcloud_login
		@dom.find( '.google' ).on 'click', @_google_login

		
		# @dom.find( '.signin' ).on 'click', @_custom_login

		# @dom.find( 'input' ).keypress (event) =>
		# 	if event.which is 13
		# 		event.preventDefault();
		# 		@_custom_login()
		# 		return false
			

	_facebook_login: ( ) =>
		log "[Login] _facebook_login"

	_soundcloud_login: ( ) =>
		log "[Login] _soundcloud_login"

	_google_login: ( ) =>
		log "[Login] _google_login"

	# _custom_login: ( ) =>
	# 	@dom.removeClass "error"
	# 	if @username.val().length <= 0 or @password.val().length <= 0
	# 		log "[Login] error"
	# 		@dom.addClass "error"
	# 		return false

	# 	data:
	# 		username: @username.val()
	# 		password: @password.val()

	# 	log "[Login] submitting data", data
