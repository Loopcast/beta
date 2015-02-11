module.exports = class Header
	constructor: ( @dom ) ->
		app.on 'user:logged', @on_user_logged


	on_user_logged: ( data ) =>
		tmpl = require 'templates/shared/header_user_logged'
		html = tmpl data
		log '[Header] on_user_logged', data, html
		@dom.find( '.user_logged' ).empty().append html



	on_user_unlogged: ( data ) =>
