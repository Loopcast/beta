$.notify.defaults
  # autoHide: false
  autoHideDelay: 5000
  clickToHide: false
  showAnimation: 'fadeIn'
  hideAnimation: 'fadeOut'

$.notify.addStyle 'loopcast',
  html: "<div><span class='close-notify'>X</span><span data-notify-text/></div>"

$.notify.addStyle 'guest_room_logged',
  html: 
    "<div><span class='close-notify'>X</span><span data-notify-text/> <a href='/rooms/create'>Click here</a></div>"

$.notify.addStyle 'guest_room_unlogged',
  html: 
    "<div><span class='close-notify'>X</span><span data-notify-text/> <a href='#' data-view='components/login_popup_handler'>Click here</a></div>"

$(document).on 'click', '.close-notify', ->
  $(@).trigger 'notify-hide'

module.exports = 
  info: (msg) ->
    $.notify msg, style: 'loopcast'

  guest_room_logged: (msg) ->
    $.notify msg, 
      style: 'guest_room_logged'
      autoHide: false

  guest_room_unlogged: (msg) ->
    $.notify msg, 
      style: 'guest_room_unlogged'
      autoHide: false

    delay 10, -> view.bind( '.notifyjs-corner' )

  error: (msg) ->
    $.notify msg, style: 'loopcast'
