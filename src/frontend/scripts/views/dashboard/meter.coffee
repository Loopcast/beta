notify   = require 'app/controllers/notify'
appcast  = require 'app/controllers/appcast'
RoomView = require 'app/views/room/room_view'
user     = require 'app/controllers/user'
_        = require 'lodash'
waveform      = null
data          = []
MAX_WIDTH     = 338
VOL_FLOOR     = 0.03
frame_counter = 0

module.exports = class Meter extends RoomView
  disabled: true
  current_block_index: -1
  blocks: []
  gain: 5
  size_block : 0
  no_sound: true

  constructor: (@dom) ->  
    
    super @dom

    @dom.width  MAX_WIDTH
    @dom.height 31

    data = []

    for i in [0...MAX_WIDTH]
      data.push VOL_FLOOR

    waveform = window.waveform = new Waveform
      container: @dom[0]
      data     : [1, 0.2, 0.5]
      width    : MAX_WIDTH
      height   : 31
      innerColor : "#dedede"
      # outerColor : "#46505A"
      interpolate: false

    ctx = waveform.context;

    gradient = ctx.createLinearGradient(0, 0, 0, waveform.height);
    gradient.addColorStop( 0.2,  "#fff" );
    gradient.addColorStop( 0.49, "#999" );
    gradient.addColorStop( 0.51, "#999" );
    gradient.addColorStop( 0.8,  "#fff" );

    waveform.innerColor = gradient;

    waveform.update data: data


    clipping = ->
      notify.info( "Your volume is too loud! Adjust your gain to avoid the red blinking" )

    clipping = _.throttle clipping, 10000, trailing: false

    appcast.on 'vu:clipping', ( is_clipping ) ->

      if is_clipping
        # console.log 'clipping!'

        $( ".meter_wrapper" ).addClass 'red'

        clipping()    

      else
        # console.log 'not clipping!'

        $( ".meter_wrapper" ).removeClass 'red'

    appcast.on 'vu:silent', ( is_silent ) ->

      if is_silent
        # console.log 'silent!'
      else
        # console.log 'not silent!'


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

    frame_counter++
    frame_counter = frame_counter % 3
    return if frame_counter % 3

    data.push Math.max( perc[0], VOL_FLOOR )

    data = data.slice(-MAX_WIDTH);

    waveform.update data: data

  destroy: ->
    super()
    
    if @is_room_owner
      appcast.off 'stream:vu', @set_volume
    appcast.disconnect()
