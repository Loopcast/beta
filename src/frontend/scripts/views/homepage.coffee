preload = require 'app/utils/preload'

module.exports = class Homepage
	constructor: (@dom) ->

		elements = []
		images = []

		@dom.find( '.parallax-container' ).each ->
			elements.push $( @ )
			images.push $( @ ).data( 'image-parallax' )

		preload images, ( images_loaded )->
			log "[Homepage] all images loaded"

			for el, i in elements
				log "[Homepage] building parallax", images_loaded[ i ].src, images_loaded[ i ].width, images_loaded[ i ].height
				el.parallax
					imageSrc     : images_loaded[ i ].src
					bleed        : 10
					parallax     : 'scroll'
					naturalWidth : images_loaded[ i ].width
					naturalheight: images_loaded[ i ].height

			delay 10, => app.window.obj.trigger 'resize'



	destroy: ( ) ->
		log "[Homepage] parallax remove"
		$( '.parallax-mirror' ).remove()