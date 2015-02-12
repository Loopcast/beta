navigation = require 'app/controllers/navigation'

module.exports = class Header
	current_page: ""
	constructor: ( @dom ) ->
		app.on 'user:logged', @on_user_logged
		navigation.on 'after_render', @check_menu

	check_menu: ( ) =>
		obj = $( '[data-menu]' )
		if obj.length > 0
			page = obj.data 'menu'
			
			if @current_page.length > 0
				@dom.find( '.#{@current_page}_item' ).removeClass "selected"
				app.body.removeClass "#{@current_page}_page"

			@dom.find( ".#{page}_item" ).addClass "selected"
			app.body.addClass "#{page}_page"

			@current_page = page



	on_user_logged: ( data ) =>
		
		wrapper = @dom.find( '.user_logged' )
		tmpl    = require 'templates/shared/header_user_logged'
		html    = tmpl data

		wrapper.empty().append html

		view.bind wrapper



	on_user_unlogged: ( data ) =>
