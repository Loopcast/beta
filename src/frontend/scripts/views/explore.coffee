Isotope = require 'isotope-layout'

module.exports = class Explore
	isotope: null
	constructor: ( @dom ) -> 
		view.on 'binded', @on_views_binded

	on_views_binded: (scope) =>
		return if not scope.main

		container_isotope = @dom.find( '.rooms_grid' )[ 0 ]

		@isotope.destroy() if @isotope
			
		@isotope = new Isotope container_isotope,
			itemSelector: '.item',
			gutter: 30
			layoutMode: 'masonry'
			masonry:
				columnWidth: 210,
				gutter: 30

		delay 1000, => $(window).resize()

	on_genre_click: (e) =>
		genre_id = $(e.currentTarget).data 'genre-id'
		log "click", genre_id
		
		@filters.removeClass 'selected'
		@dom.find( '.genres_list a[data-genre-id="'+genre_id+'"]' ).addClass 'selected'

		@isotope.arrange filter: ".item-#{genre_id}"

	destroy: ->
		view.off 'binded', @on_views_binded