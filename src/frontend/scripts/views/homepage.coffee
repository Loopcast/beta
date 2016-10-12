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


    @initSwipers()

    $(window).resize () =>
      @handleResize()


  initSwipers: =>
    # header carousel
    @intro = $ '.intro.swiper-container'
    options =
      direction: 'horizontal'
      loop: true
      pagination: '.swiper-pagination'
      paginationClickable: true

    # init swiper only for tablets and desktops
    if window.innerWidth > 700
      @introSwiper = new Swiper @intro, options

      # show next slide after some time
      time = 3000
      transitionDuration = 600

      @interval = setInterval () =>
        @introSwiper.slideNext false, transitionDuration
      , time


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
      @featuredSwiper = new Swiper @featured, options
      # interval next slide


  handleResize: ->
    if window.innerWidth < 700 and @introSwiper
      @introSwiper.destroy true, true
      @introSwiper = null
      clearInterval @interval

    if window.innerWidth < 700 and @featuredSwiper
      @featuredSwiper.destroy true, true
      @featuredSwiper = null

    if window.innerWidth >= 700 and not @featuredSwiper and not @introSwiper
      @initSwipers()

  
  destroy: ( ) ->
    # log "[Homepage] destroyed"
    @header.removeClass 'top'
    clearInterval @interval
    

  # on_views_binded: ( scope ) =>
  #   console.log '***** new home page views binded'
