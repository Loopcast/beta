module.exports = class LogoutLink
	constructor: ( @dom ) ->
		@dom.on 'click', (e) ->
			e.preventDefault()
			e.stopPropagation()

			user_controller.logout ->
				

