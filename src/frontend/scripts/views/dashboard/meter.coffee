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


  constructor: (@dom) ->  
    
    super @dom

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

    # @playhead = @dom.find '.playhead'

    @min_db = @values[ 0 ].value
    @max_db = @values[ @values.length - 1 ].value
    @range_db = @max_db - @min_db


    # Debug
    # left = 0.14
    # right = 0.09

    # @activate [left, right]
    # @set_volume [left, right]

    # window.meter = @


   on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    unless @is_room_owner
      @dom.remove()
      return

    delay 5000, => clearInterval @interval

    appcast.on 'stream:vu', @set_volume
    # appcast.on 'stream:vu', @activate


  deactivate: ->
    log "[Meter] deactivate", @current_block_index
    return if @current_block_index < 0
    color = @values[ @current_block_index ].color
    # @playhead
    #   .addClass( 'inactive' )
    #   .html( @values[ 0 ].value )

    # @move_playhead '', 'color_' + color, 0

  activate: (perc) =>
    return if not perc
    log "[Meter] activate", perc
    # @playhead.removeClass( 'inactive' ).addClass( 'color_' + @values[0].color )
    appcast.off 'stream:vu', @activate

  set_volume: ( perc ) =>

    log "[Meter] set_volume", perc
    left_data = @set_channel 'left', perc[0]
    right_data = @set_channel 'right', perc[1]

    max_data = left_data
    if right_data.value > left_data.value
      max_data = right_data

    # @manage_playhead max_data
    

  manage_playhead: ( data ) ->
    # @playhead.html( data.value )

    # return if @current_block_index is data.index
    # if @current_block_index >= 0
    #   old_color = @values[ @current_block_index ].color
    # else
    #   old_color = ""

    # new_color  = @values[ data.index ].color

    # @move_playhead 'color_' + new_color, 'color_' + old_color, data.index

    # @current_block_index = data.index


  set_channel: ( c, raw ) ->

    # Getting value and block index
    data = @get_info_from_raw_value raw
  
    # activate the lower blocks
    for index in [0..data.index]
      @blocks[ index ][ c ].addClass 'active'

    # deactivate the upper blocks
    for index in [data.index+1...@blocks.length]
      @blocks[ index ][ c ].removeClass 'active'

    return data


  get_info_from_raw_value: ( raw ) ->
    # Converting the raw value to the db range [@min_db,@max_db]
    value = @range_db * raw * @gain + @min_db
    # Normalize the value
    value = Math.max( @min_db, Math.min( value, @max_db ) ).toFixed(1)
    
    index = @get_the_block_index_from_value value

    return value: value, index: index

  
  move_playhead: ( new_color, old_color, x ) ->
    # css = "translate3d(#{35*x}px,0,0)"
    # @playhead
    #   .removeClass( old_color )
    #   .addClass( new_color )
    #   .css
    #     '-webkit-transform' : css
    #     '-moz-transform' : css
    #     '-ms-transform' : css
    #     'transform' : css    

  get_the_block_index_from_value: ( value ) ->
    for item, i in @values
      if i is @values.length - 1
        return i
      if item.value <= value < @values[i+1].value
        return i

  destroy: ->
    if @is_room_owner
      appcast.off 'stream:vu', @set_volume
