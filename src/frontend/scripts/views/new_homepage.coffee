Happens         = require 'happens'


module.exports = class NewHomePage
  constructor: ( @dom ) ->

    Happens @
    # view.once 'binded', @on_views_binded


    
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
    

  # on_views_binded: ( scope ) =>
  #   console.log '***** new home page views binded'
