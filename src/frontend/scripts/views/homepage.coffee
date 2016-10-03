Happens         = require 'happens'
preload         = require 'app/utils/preload'
Swiper          = require 'swiper'


module.exports = class NewHomePage
  constructor: ( @dom ) ->

    Happens @
    # view.once 'binded', @on_views_binded


    # Header functionality
    @header = $ 'header'
    @header.addClass 'top'

    # search field
    search_input = @header.find('.search_box input')
    
    search_input.focus ->
      $(this).addClass 'focus'
      $(this).closest('.search_box').addClass 'focus'

    search_input.blur ->
      $(this).removeClass 'focus'
      $(this).closest('.search_box').removeClass 'focus'


    # header carousel
    @intro = $ '.intro.swiper-container'
    options =
      direction: 'horizontal'
      loop: true
      pagination: '.swiper-pagination'
      paginationClickable: true

    # init swiper only for tablets and desktops
    if window.innerWidth > 700
      introSwiper = new Swiper @intro, options


    # featured channels carousel
    @featured = $ '.featured .swiper-container'
    options = 
      direction: 'horizontal'
      loop: true
      slidesPerView: 5
      slidesPerGroup: 5
      spaceBetween: 25
      prevButton: '.prevSlide'
      nextButton: '.nextSlide'

    # init swiper only for tablets and desktops
    if window.innerWidth > 700
      featuredSwiper = new Swiper @featured, options



  destroy: ( ) ->
    # log "[Homepage] destroyed"
    @header.removeClass 'top'
    

  # on_views_binded: ( scope ) =>
  #   console.log '***** new home page views binded'
