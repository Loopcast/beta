require 'app/utils/time/livestamp'
module.exports = class TapeView
  constructor: ( @dom ) ->
    log "TAPE VIEW"
    $('body').addClass 'tape_view'

  destroy: ->
    log "TAPE VIEW (destroy)"
    $('body').removeClass 'tape_view'