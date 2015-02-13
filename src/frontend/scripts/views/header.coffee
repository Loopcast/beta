navigation      = require 'app/controllers/navigation'
user_controller = require 'app/controllers/user'

module.exports = class Header

	current_page: ""

	constructor: ( @dom ) ->
		user_controller.on 'user:logged', @on_user_logged
		user_controller.on 'user:unlogged', @on_user_unlogged

		navigation.on 'after_render', @check_menu

	check_menu: =>
		obj = $( '[data-menu]' )
		if obj.length > 0
			page = obj.data 'menu'
			log "[Header] check_menu", page
			
			if @current_page.length > 0
				@dom.find( ".#{@current_page}_item" ).removeClass "selected"
				app.body.removeClass "#{@current_page}_page"

			@dom.find( ".#{page}_item" ).addClass "selected"
			app.body.addClass "#{page}_page"

			@current_page = page


	on_user_logged: ( data ) =>

		
		wrapper = @dom.find( '.user_logged' )
		tmpl    = require 'templates/shared/header_user_logged'
		html    = tmpl data

		log "[Header] on_user_logged", data, html

		log "wrapper", wrapper.length, wrapper

		wrapper.empty().append html

		view.bind wrapper



	on_user_unlogged: ( data ) =>
		log "[Header] on_user_unlogged", data