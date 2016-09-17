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
      $(this).closest('.search_box').addClass 'focus'

    search_input.blur ->
      $(this).removeClass 'focus'
      $(this).closest('.search_box').removeClass 'focus'



  destroy: ( ) ->
    # log "[Homepage] destroyed"
    @header.removeClass 'top'
    

  # on_views_binded: ( scope ) =>
  #   console.log '***** new home page views binded'
