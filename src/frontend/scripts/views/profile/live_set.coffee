time_to_string = require 'app/utils/time/time_to_string'
moment = require 'moment'

module.exports = class LiveSet 
  interval: null
  constructor: (@dom) ->
    now = moment()
    @started_at = @dom.data 'room-started-at'

    now_converted = moment(now, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ')

    log "now", now


    @time = @dom.find '.time'

    log "[LiveSet]", @started_at

    @interval = setInterval @update, 1000

  update: =>
    time = time_to_string @started_at
    @time.html time


  destroy: ->
    if @interval
      clearInterval @interval