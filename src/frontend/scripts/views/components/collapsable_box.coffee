module.exports = (dom) ->
  max = 300
  original_h = 0
  dom.addClass 'collapsable_box'

  init = ->
    app.on 'info_box:updated', update

    dom.find( '.show_more' ).on 'click', expand
    dom.find( '.show_less' ).on 'click', collapse

    delay 1000, update

  update = ->

    original_h = dom.height()

    log "[Update] original_h", original_h
    if original_h > max
      dom.addClass 'collapsable'
      dom.height max
    else
      dom.removeClass( 'collapsable' ).removeClass( 'expanded' )
      dom.height 'auto'

  expand = ->
    dom.height( original_h + 50 ).addClass( 'expanded' )


  collapse = ->
    dom.height( max ).removeClass( 'expanded' )

  init()