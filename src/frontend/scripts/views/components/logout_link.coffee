user_controller = require 'app/controllers/user'

module.exports = ( dom ) ->

	dom.on 'click', ( e ) ->
		e.preventDefault()
		e.stopPropagation()

		user_controller.logout ( error ) ->

      if error then console.error error
      
			log "[LogoutLink] logout succedeed."