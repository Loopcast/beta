preload = require 'app/utils/preload'
happens = require 'happens'
module.exports = class Homepage
	constructor: (@dom) ->

		log "[Homepage] created"

		happens @

		@dom.addClass 'request_preloading'

		elements = []
		images = []

		@dom.find( '.parallax-container' ).each ->
			elements.push $( @ )
			images.push $( @ ).data( 'image-parallax' )

		preload images, ( images_loaded ) =>

			log "[Preloaded]", images_loaded

			for el, i in elements
				log "parallax", i
				el.parallax
					imageSrc     : images_loaded[ i ].src
					bleed        : 10
					parallax     : 'scroll'
					naturalWidth : images_loaded[ i ].width
					naturalheight: images_loaded[ i ].height

			
			@ready()

	ready: ->
		delay 100, -> app.window.obj.trigger 'resize'
		delay 200, => @emit 'ready'


	destroy: ( ) ->
		log "[Homepage] destroyed"
		p = $( '.parallax-mirror' )
		p.addClass( 'hide' )
		delay 300, -> p.remove()