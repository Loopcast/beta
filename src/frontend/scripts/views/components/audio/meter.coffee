module.exports = class Meter

  constructor: (@dom) ->  
    @progress = @dom.find '.meter span'

    @is_left = @dom.attr( 'class' ).indexOf( "left" ) isnt -1

    appcast.on 'stream:vu', ( meter ) =>

      if @is_left
        @set_volume meter[0] * 5
      else
        @set_volume meter[1] * 5

  set_volume: ( perc ) ->

    @progress.css 'width', "#{perc * 100}%"

