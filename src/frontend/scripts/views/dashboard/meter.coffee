module.exports = class Meter

  constructor: (@dom) ->  
    tmpl = require 'templates/components/audio/meter'
    block_tmpl = require 'templates/components/audio/meter_block'



    ###
         -20 = Green 
-15 = Green 
-10 = Green 
-6 = Green 
-3 = Green 
+0 =Yellow 
+3 =Yellow
+6 = Darker yellow
+10 = Red
    ###
    values = [

 


      { value: -20, id: "m_20", color: "green" },
      { value: -15, id: "m_15", color: "green" },
      { value: -10, id: "m_10", color: "green" },
      { value: -6,  id: "m_6", color: "green" },
      { value: -3,  id: "m_3", color: "green" },
      { value: 0,   id: "0", color: "yellow" },
      { value: 3,   id: "3", color: "yellow" },
      { value: 6,   id: "6", color: "dark_yellow" },
      { value: 10,  id: "10", color: "red" }
    ]

    blocks = ""
    for v in values 
      blocks += block_tmpl v

    @dom.append tmpl()

    @dom.find( '.meter_inner' ).append blocks






  #   @progress = @dom.find '.meter span'

  #   @is_left = @dom.attr( 'class' ).indexOf( "left" ) isnt -1

  #   appcast.on 'stream:vu', ( meter ) =>

  #     if @is_left
  #       @set_volume meter[0]
  #     else
  #       @set_volume meter[1]

  set_volume: ( perc ) ->

    # @progress.css 'width', "#{perc * 100}%"

