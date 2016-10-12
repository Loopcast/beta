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

    if window.innerWidth > 699 then @init_swiper true

    $(window).resize () =>
      @handleResize()

    @slides = @dom.find '.swiper-slide'


  handleResize: ->
    if window.innerWidth < 700 and @swiper
      @swiper.destroy true, true
      @swiper = null
      setTimeout =>
        @slides.width 'auto'
      , 50

    else
      @init_swiper false


  init_swiper: (prepareSlides) ->

    if prepareSlides
      cells = @dom.find('.room_cell')
      slidesCount = Math.ceil( cells.length / 10 )
      wrapper = $ '.swiper-wrapper'

      for a in [1..slidesCount]
        wrapper.append('<div class="swiper-slide"></div>')

      slides = wrapper.find '.swiper-slide'

      for cell, index in cells
        slideIndex = Math.floor( index / 10 )
        cells.eq(index).appendTo( slides.eq(slideIndex) )

        if index % 5 is 0
          cells.eq(index).addClass 'first-inline'

      @container = $ '.swiper-container'

    options =
      direction: 'horizontal'
      loop: false
      prevButton: '.prevSlide'
      nextButton: '.nextSlide'
      pagination: '.pagination'

    @swiper = new Swiper @container, options


  on_genre_click: (e) =>
    # genre_id = $(e.currentTarget).data 'genre-id'
    # log "click", genre_id
    
    # @filters.removeClass 'selected'
    # @dom.find( '.genres_list a[data-genre-id="'+genre_id+'"]' ).addClass 'selected'

    # @isotope.arrange filter: ".item-#{genre_id}"

  destroy: ->
    view.off 'binded', @on_views_binded