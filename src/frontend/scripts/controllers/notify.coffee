$.notify.defaults
  # autoHide: false
  autoHideDelay: 5000
  clickToHide: false
  showAnimation: 'fadeIn'
  hideAnimation: 'fadeOut'

$.notify.addStyle 'loopcast',
  html: "<div><span class='close-notify'>X</span><span data-notify-text/></div>"

$(document).on 'click', '.close-notify', ->
  $(@).trigger 'notify-hide'

module.exports = 
  info: (msg) ->
    $.notify msg, style: 'loopcast'

  error: (msg) ->
    $.notify msg, style: 'loopcast'
