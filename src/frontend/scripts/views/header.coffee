module.exports = class Header
	constructor: ( @dom ) ->
		app.on 'user:logged', @on_user_logged


	on_user_logged: ( data ) =>
		
		wrapper = @dom.find( '.user_logged' )
		tmpl    = require 'templates/shared/header_user_logged'
		html    = tmpl data

		wrapper.empty().append html

		view.bind wrapper



	on_user_unlogged: ( data ) =>
