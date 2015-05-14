Opacity       = require 'app/utils/opacity'

class Login
  constructor: ->
    


  start: ->
    log 'start', $( '.social' ).length
    @body = $( 'body' ).addClass 'body_login'
    @loading = $( '#loading' )
    @hide_loading()

    ref = @
    $( '.social' ).on 'click', (e) ->
      e.preventDefault()
      e.stopPropagation()

      ref.show_loading()
      href = $( @ ).attr 'href' 

      location.href = href
      

      return false

  show_loading: ->
    @body.addClass( 'loading' ).removeClass( 'loaded' )
    Opacity.show @loading, 100

  hide_loading: ->
    @body.removeClass( 'loading' ).addClass( 'loaded' )
    Opacity.hide @loading

login = new Login

module.exports = login