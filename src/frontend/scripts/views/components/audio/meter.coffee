module.exports = class Meter
  constructor: (@dom) ->  
    @progress = @dom.find '.meter span'

  set_volume: ( perc ) ->
    @progress.css 'width', "#{perc*100}%"

