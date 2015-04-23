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
      @blocks.push $( item )

    @playhead = @dom.find '.playhead'


   on_room_created: (@room_id, @owner_id) =>
    
    super @room_id, @owner_id

    unless @is_room_owner
      @dom.remove()
      return

    # DEBUG
    # @interval = setInterval =>
    #   @set_volume Math.random()
    # , 500

    delay 5000, => clearInterval @interval

    appcast.on 'stream:vu', @set_volume


  deactivate: ->
    log "[Meter] deactivate"
    @playhead.addClass 'inactive'

  activate: ->
    log "[Meter] activate"
    @playhead.removeClass( 'inactive' ).addClass( 'color_' + @values[0].color )

  set_volume: ( perc ) =>
    if perc.constructor is Array
      perc = perc[ 0 ]

    # Convert from percentage to db
    value = 30 * perc - 20

    # Normalize the value
    value = Math.max( -20, Math.min( value, 10 ) ).toFixed(1)

    # Update the playhead value
    @playhead.html( value )

    # get the corrispondent block
    i = @get_the_block_index_from_value value

    # If it's the same block we don't need to move the playhead
    return if i is @current_block_index
    if @current_block_index >= 0
      old_color = @values[ @current_block_index ].color
    else
      old_color = ""

    new_color  = @values[ i ].color
    @current_block_index = i

    # activate the lower blocks
    for index in [0..i]
      @blocks[ index ].addClass 'active'

    # deactivate the upper blocks
    for index in [i+1...@blocks.length]
      @blocks[ index ].removeClass 'active'

    # Snap the playead to that block
    b = @values[ i ]
    css = "translate3d(#{35*i}px,0,0)"

    log "[Meter] color", new_color
    @playhead
      .removeClass( 'color_' + old_color )
      .addClass( 'color_' + new_color )
      .css
        '-webkit-transform' : css
        '-moz-transform' : css
        '-ms-transform' : css
        'transform' : css    

  get_the_block_index_from_value: ( value ) ->
    for item, i in @values
      if i is @values.length - 1
        return i
      if item.value <= value < @values[i+1].value
        return i

  destroy: ->
    if @is_room_owner
      appcast.off 'stream:vu', @set_volume
