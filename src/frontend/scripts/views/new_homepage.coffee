Happens         = require 'happens'
preload         = require 'app/utils/preload'


module.exports = class NewHomePage
  constructor: ( @dom ) ->

    Happens @
    # view.once 'binded', @on_views_binded


    # Header functionality
    @header = $ 'header'
    @header.addClass 'top'

    search_input = @header.find('.search_box input')
    
    search_input.focus ->
      $(this).addClass 'focus'

    search_input.blur ->
      $(this).removeClass 'focus'


    $(window).scroll () =>
      top = $(window).scrollTop()

      if top > 0
        @header.removeClass 'top'
      else
        @header.addClass 'top'


    # Parallax functionality
    @dom.addClass 'request_preloading'

    elements = []
    images = []

    @dom.find( '.parallax-container' ).each ->
      elements.push $( @ )
      images.push $( @ ).data( 'image-parallax' )

    preload images, ( images_loaded ) =>

      # log "[Preloaded]", images_loaded

      for el, i in elements
        # log "parallax", i
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
    # log "[Homepage] destroyed"
    p = $( '.parallax-mirror' )
    p.addClass( 'hide' )
    delay 300, -> p.remove()
    

  # on_views_binded: ( scope ) =>
  #   console.log '***** new home page views binded'
