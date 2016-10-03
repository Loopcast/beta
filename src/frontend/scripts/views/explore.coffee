Swiper = require 'swiper'


module.exports = class Explore
  isotope: null
  constructor: ( @dom ) -> 
    # log "[Creating explore]"
    view.on 'binded', @on_views_binded

  on_views_binded: (scope) =>
    return if not scope.main

    @dom.removeClass 'no_result_explore'

    if @dom.find( '.room_cell' ).length <= 0
      @dom.addClass 'no_result_explore'
      return

    @container = $ '.swiper-container'
    options =
      direction: 'horizontal'
      loop: true
      slidesPerView: 5
      slidesPerGroup: 10
      slidesPerColumn: 2
      spaceBetween: 25
      prevButton: '.prevSlide'
      nextButton: '.nextSlide'

    swiper = new Swiper @container, options


  on_genre_click: (e) =>
    # genre_id = $(e.currentTarget).data 'genre-id'
    # log "click", genre_id
    
    # @filters.removeClass 'selected'
    # @dom.find( '.genres_list a[data-genre-id="'+genre_id+'"]' ).addClass 'selected'

    # @isotope.arrange filter: ".item-#{genre_id}"

  destroy: ->
    view.off 'binded', @on_views_binded