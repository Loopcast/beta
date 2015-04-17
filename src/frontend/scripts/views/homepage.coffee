preload = require 'app/utils/preload'
happens = require 'happens'
module.exports = class Homepage
	constructor: (@dom) ->

		happens @

		@dom.addClass 'request_preloading'

		elements = []
		images = []

		@dom.find( '.parallax-container' ).each ->
			elements.push $( @ )
			images.push $( @ ).data( 'image-parallax' )

		ref = @
		preload images, ( images_loaded )->

			for el, i in elements
				el.parallax
					imageSrc     : images_loaded[ i ].src
					bleed        : 10
					parallax     : 'scroll'
					naturalWidth : images_loaded[ i ].width
					naturalheight: images_loaded[ i ].height

			

			delay 100, => app.window.obj.trigger 'resize'
			delay 200, => ref.emit 'ready'


	destroy: ( ) ->
		p = $( '.parallax-mirror' )
		p.addClass( 'hide' )
		delay 300, -> p.remove()