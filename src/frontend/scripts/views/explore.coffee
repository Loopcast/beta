Isotope = require 'isotope-layout'

module.exports = class Explore
  isotope: null
  constructor: ( @dom ) -> 
    log "[Creating explore]"
    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main

    @dom.removeClass 'no_result_explore'
    container_isotope = @dom.find( '.rooms_grid' )[ 0 ]

    @isotope.destroy() if @isotope

    if @dom.find( '.room_cell' ).length <= 0
      @dom.addClass 'no_result_explore'
      return


    if $( 'input[name=current_genre]' ).length > 0
      current_genre = $( 'input[name=current_genre]' ).val()
      
    @isotope = new Isotope container_isotope,
      itemSelector: '.item',
      gutter: 30
      layoutMode: 'masonry'
      masonry:
        columnWidth: 210,
        gutter: 30

    @filters = @dom.find '.genres_list a'
    @filters.removeClass 'selected'
    @dom.find( '.genres_list a[data-genre-id="'+current_genre+'"]' ).addClass 'selected'


    delay 1000, => $(window).resize()

  on_genre_click: (e) =>
    # genre_id = $(e.currentTarget).data 'genre-id'
    # log "click", genre_id
    
    # @filters.removeClass 'selected'
    # @dom.find( '.genres_list a[data-genre-id="'+genre_id+'"]' ).addClass 'selected'

    # @isotope.arrange filter: ".item-#{genre_id}"

  destroy: ->
    view.off 'binded', @on_views_binded