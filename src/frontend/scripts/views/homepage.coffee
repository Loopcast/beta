preload = require 'app/utils/preload'

module.exports = class Homepage
	constructor: (@dom) ->

		elements = []
		images = []

		@dom.find( '.parallax-container' ).each ->
			elements.push $( @ )
			images.push $( @ ).data( 'image-parallax' )

		preload images, ( images_loaded )->

			for el, i in elements
				el.parallax
					imageSrc     : images_loaded[ i ].src
					bleed        : 10
					parallax     : 'scroll'
					naturalWidth : images_loaded[ i ].width
					naturalheight: images_loaded[ i ].height

			delay 100, => app.window.obj.trigger 'resize'


	destroy: ( ) ->
		p = $( '.parallax-mirror' )
		p.addClass( 'hide' )
		delay 300, -> p.remove()