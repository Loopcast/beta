navigation        	= require 'app/controllers/navigation'
Opacity 			= require 'app/utils/opacity'

module.exports = class Loading
	constructor: ( @dom ) ->
		navigation.on 'before_destroy', =>
			app.body.addClass 'loading'
			Opacity.show @dom

		navigation.on 'after_render', => 
			app.body.removeClass 'loading'
			Opacity.hide @dom