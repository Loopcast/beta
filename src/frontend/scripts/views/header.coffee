navigation      = require 'app/controllers/navigation'
user_controller = require 'app/controllers/user'
module.exports = class Header

	current_page: ""
	user_logged: false

	constructor: ( @dom ) ->
		user_controller.on 'user:logged', @on_user_logged
		user_controller.on 'user:unlogged', @on_user_unlogged
		user_controller.on 'user:updated', @on_user_updated

		navigation.on 'content:ready', @check_menu
		@check_menu()

	check_menu: =>
		
		obj = $( '[data-menu]' )
		log "[Header]", obj.length
		if obj.length > 0
			page = obj.data 'menu'
			log "[Header] check_menu", page
			
			if @current_page.length > 0
				$( ".#{@current_page}_item" ).removeClass "selected"
				app.body.removeClass "#{@current_page}_page"

			log "[Header]", ".#{page}_item"
			$( ".#{page}_item" ).addClass "selected"
			app.body.addClass "#{page}_page"

			@current_page = page


		obj = $( '[data-menu-fixed]' )
		if obj.length > 0
			if obj.data( 'menu-fixed') is false
				app.body.addClass 'unfixed'
		else
			app.body.removeClass 'unfixed'



	on_user_logged: ( data ) =>
		return if @user_logged

		@user_logged = true
		
		wrapper = @dom.find( '.user_logged' )
		tmpl    = require 'templates/shared/header_user_logged'
		html    = tmpl data

		wrapper.empty().append html

		view.bind wrapper

		@dom.find( '.myprofile_link' ).off( 'click' ).on( 'click', -> 
			navigation.go( "/" + user_controller.data.username )
		)  
		# navigation.bind wrapper

	on_user_updated: ( data ) =>
		# log "[Header] udpating image", data.images.top_bar
		@dom.find( '.top_bar_icon' ).attr 'src', data.images.top_bar
		# @dom.find( '.myprofile_link' ).off( 'click' ).on( 'click', -> 
		# 	navigation.go( "/" + data.username )
		# )  




	on_user_unlogged: ( data ) =>
		return if not @user_logged
		@user_logged = false