# $.notify.defaults
#   autoHide: false

module.exports = 
  info: (msg) ->
    $.notify msg, 'info'

  error: (msg) ->
    $.notify msg, 'error'
