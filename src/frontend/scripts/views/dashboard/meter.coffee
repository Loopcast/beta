appcast = require 'app/controllers/appcast'
RoomView = require 'app/views/room/room_view'
user = require 'app/controllers/user'

module.exports = class Meter extends RoomView
  values : [
    { value: -20, id: "m_20", color: "green" },
    { value: -15, id: "m_15", color: "green" },
    { value: -10, id: "m_10", color: "green" },
    { value: -6,  id: "m_6",  color: "green" },
    { value: -3,  id: "m_3",  color: "green" },
    { value: 0,   id: "0",    color: "yellow" },
    { value: 3,   id: "3",    color: "yellow" },
    { value: 6,   id: "6",    color: "dark_yellow" },
    { value: 10,  id: "10",   color: "red" }
  ]
  current_block_index: -1
  blocks: []
  gain: 5
  size_block : 0
  no_sound: true

  constructor: (@dom) ->  
    
    super @dom

    # @debug = $ '#debug'

    @size_block = 1 / @values.length

    # Build the meter
    tmpl = require 'templates/components/audio/meter'
    block_tmpl = require 'templates/components/audio/meter_block'
    
    blocks_html = ""
    for v in @values 
      blocks_html += block_tmpl v

    @dom.append tmpl()

    @dom.find( '.blocks' ).append blocks_html

    for item in @dom.find( '.block' )
      @blocks.push 
        'left': $( item ).find( '.left_channel' )
        'right': $( item ).find( '.right_channel' )


   on_room_created: (@room_id, @owner_id) =>
    
    # log "[Meter] on_room_created"
    super @room_id, @owner_id

    unless @is_room_owner
      @dom.remove()
      return

    delay 5000, => clearInterval @interval

    appcast.on 'stream:vu', @set_volume
    # appcast.on 'stream:vu', @activate


  deactivate: ->
    # log "[Meter] deactivate", @current_block_index
    return if @current_block_index < 0


  activate: (perc) =>
    return if not perc
    # log "[Meter] activate", perc
    appcast.off 'stream:vu', @activate

  set_volume: ( perc ) =>
    # @debug.html perc[ 0 ] + "<br/>" + perc[ 1 ]
    @set_channel 'left', perc[0]
    @set_channel 'right', perc[1]  

    if perc[0] <= 0 and perc[1] <= 0
      if not @no_sound
        @no_sound = true
        @turn_off()
    else
      if @no_sound
        @no_sound = false
        @turn_on()

  turn_off : ->
    @dom.addClass( 'no_sound' ).removeClass( 'with_sound' )

  turn_on : ->
    @dom.removeClass( 'no_sound' ).addClass( 'with_sound' )

  
  ###
  c = left|right   channel name
  fraction = [0,1] volume value 
  ###
  set_channel: ( c, fraction ) ->

    # Getting value and block index
    data = 
      value: fraction
      index: @get_the_block_index_from_value fraction
    

    return if data.index < 0
    # activate the lower blocks
    for index in [0..data.index]
      @blocks[ index ][ c ].addClass 'active'

    # deactivate the upper blocks
    for index in [data.index+1...@blocks.length]
      @blocks[ index ][ c ].removeClass 'active'

    return data
  

  get_the_block_index_from_value: ( value ) ->

    if value <= 0
      return -1

    if value >= 1
      return @values.length
    index = Math.floor( value / @size_block ) 
    return index

  destroy: ->
    if @is_room_owner
      appcast.off 'stream:vu', @set_volume
