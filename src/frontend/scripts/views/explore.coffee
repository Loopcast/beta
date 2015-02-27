Isotope = require 'isotope-layout'
module.exports = (dom) ->

	container_isotope = dom.find( '.rooms_grid' )[ 0 ]

	isotope = new Isotope container_isotope,
		itemSelector: '.item',
		gutter: 30
		layoutMode: 'masonry'
		masonry:
			columnWidth: 210,
			gutter: 30
	
	filters = dom.find '.genres_list a'

	dom.find( '[data-genre-id]' ).on 'click', (e) ->
		# Filter by genre
		genre_id = $(e.currentTarget).data 'genre-id'
		log "click", genre_id
		
		filters.removeClass 'selected'
		dom.find( '.genres_list a[data-genre-id="'+genre_id+'"]' ).addClass 'selected'

		isotope.arrange filter: ".item-#{genre_id}"