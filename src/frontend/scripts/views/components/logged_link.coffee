user_controller = require 'app/controllers/user'
login_popup = require 'app/utils/login_popup'

module.exports = (dom) ->

	original_url = dom.attr 'href'

	on_click = -> 
		app.settings.after_login_url = original_url
		do login_popup
		return false

	on_user_logged = (data) ->
		dom.attr 'href', original_url
		dom.off 'click', on_click

	on_user_unlogged = (data) ->
		dom.attr 'href', '#'
		dom.on 'click', on_click

	user_controller.on 'user:logged',   on_user_logged
	user_controller.on 'user:unlogged', on_user_unlogged

	if user_controller.is_logged()
		do on_user_logged
	else
		do on_user_unlogged

