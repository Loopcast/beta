navigation      = require 'app/controllers/navigation'
user_controller = require 'app/controllers/user'
module.exports = class Header

	current_page: ""
	user_logged: false

	constructor: ( @dom ) ->
		user_controller.on 'user:logged', @on_user_logged
		user_controller.on 'user:unlogged', @on_user_unlogged

		navigation.on 'after_render', @check_menu

	check_menu: =>
		
		obj = $( '[data-menu]' )
		if obj.length > 0
			page = obj.data 'menu'
			# log "[Header] check_menu", page
			
			if @current_page.length > 0
				@dom.find( ".#{@current_page}_item" ).removeClass "selected"
				app.body.removeClass "#{@current_page}_page"

			@dom.find( ".#{page}_item" ).addClass "selected"
			app.body.addClass "#{page}_page"

			@current_page = page


		obj = $( '[data-submenu]' )
		if obj.length > 0
			submenu = obj.data 'submenu'
			$( ".#{submenu}" ).addClass 'selected'


		obj = $( '[data-menu-fixed]' )
		if obj.length > 0
			if obj.data( 'menu-fixed') is false
				app.body.addClass 'unfixed'
		else
			app.body.removeClass 'unfixed'



	on_user_logged: ( data ) =>

		log "[Header] on_user_logged", data
		return if @user_logged
		@user_logged = true
		
		wrapper = @dom.find( '.user_logged' )
		tmpl    = require 'templates/shared/header_user_logged'
		html    = tmpl data

		wrapper.empty().append html

		view.bind wrapper
		navigation.bind wrapper



	on_user_unlogged: ( data ) =>
		return if not @user_logged
		@user_logged = false