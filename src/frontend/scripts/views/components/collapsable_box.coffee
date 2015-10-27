module.exports = (dom) ->
  max = 187
  original_h = 0

  init = ->
    app.on 'info_box:updated', update

    dom.find( '.show_more' ).on 'click', expand
    dom.find( '.show_less' ).on 'click', collapse

    delay 1000, update
    delay 1300, ->
      dom.parents('.profile_bio').addClass 'ready'

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