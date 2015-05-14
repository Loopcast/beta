navigation        	= require 'app/controllers/navigation'
Opacity 			= require 'app/utils/opacity'

module.exports = class Loading
	first_time: on
	constructor: ( @dom ) ->
		# navigation.on 'before_destroy', =>
		app.on 'loading:show', =>
			app.body.addClass( 'loading' ).removeClass( 'loaded' )
			Opacity.show @dom, 100
			# console.error "[Loading] show"

		# navigation.on 'after_render', => 
		app.on 'loading:hide', =>
			
			if @first_time
				app.body.addClass 'first_loaded'
				@first_time = off

			
			# console.error "[Loading] hide"
			app.body.removeClass( 'loading' ).addClass( 'loaded' )
			Opacity.hide @dom	
