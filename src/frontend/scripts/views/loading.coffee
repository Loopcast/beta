navigation        	= require 'app/controllers/navigation'
Opacity 			= require 'app/utils/opacity'

module.exports = class Loading
	first_time: on
	constructor: ( @dom ) ->
		navigation.on 'before_destroy', =>
			app.body.addClass( 'loading' ).removeClass( 'loaded' )
			Opacity.show @dom, 100

		navigation.on 'after_render', => 
			if @first_time
				app.body.addClass 'first_loaded'
				@first_time = off
			app.body.removeClass( 'loading' ).addClass( 'loaded' )
			Opacity.hide @dom