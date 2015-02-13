navigation        	= require 'app/controllers/navigation'
Opacity 			= require 'app/utils/opacity'

module.exports = class Loading
	constructor: ( @dom ) ->
		navigation.on 'before_destroy', =>
			app.body.addClass( 'loading' ).removeClass( 'loaded' )
			Opacity.show @dom, 100

		navigation.on 'after_render', => 
			app.body.removeClass( 'loading' ).addClass( 'loaded' )
			Opacity.hide @dom