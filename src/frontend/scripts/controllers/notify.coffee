style_html = (class_icon) ->
  str = """
    <div>
      <span class='close-notify'>X</span>
      <span class='icon #{class_icon}'></span>
      <span data-notify-text/>
    </div>
    """
  str



$.notify.defaults
 #autoHide: false
  autoHideDelay: 10000
  clickToHide: false
  showAnimation: 'fadeIn'
  hideAnimation: 'fadeOut'

$.notify.addStyle 'loopcast_info',
  html: style_html( "ss-info" )
$.notify.addStyle 'loopcast_success',
  html: style_html( "ss-check" )
$.notify.addStyle 'loopcast_error',
  html: style_html( "ss-alert" )

$.notify.addStyle 'guest_room_logged',
  html: 
    "<div><span class='close-notify'>X</span><span data-notify-text/></div>"

$.notify.addStyle 'guest_room_unlogged',
  html: 
    "<div><span class='close-notify'>X</span><span data-notify-text/></div>"

$(document).on 'click', '.close-notify', ->
  $(@).trigger 'notify-hide'

module.exports = 
  info: (msg) ->
    $.notify msg, style: 'loopcast_info'

  success: (msg) ->
    $.notify msg, style: 'loopcast_success'

  error: (msg) ->
    $.notify msg, style: 'loopcast_error'

  guest_room_logged: (msg) ->
    $.notify msg, 
      style: 'loopcast_success'

  guest_room_unlogged: (msg) ->
    $.notify msg, 
      style: 'loopcast_success'

    delay 10, -> view.bind( '.notifyjs-corner' )

  
