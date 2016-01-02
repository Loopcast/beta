time_to_string = require 'app/utils/time/time_to_string'
now_to_seconds = require 'app/utils/time/now_to_seconds'
happens = require 'happens'
notify          = require 'app/controllers/notify'

module.exports = class AudioElement
  timer_interval: null
  loading_interval: null 
  info_loading_showed: false
  is_playing: false
  duration: 0
  last_time: ""
  snapping: false
  mobile_played: false
  data:
    id: ""
    src: ""
    start_time: ""
    is_recorded: false


  constructor: (@dom) ->
    happens @

    # @debug = $ '#debug'
    @dom[0].addEventListener 'loadedmetadata', @on_loaded_metadata
    @dom[0].addEventListener 'playing', @on_started
    @dom[0].addEventListener 'pause', @on_paused
    @dom[0].addEventListener 'ended', @on_ended

  set_data: ( data ) ->
    # return if @data.id is data.id

    @data = data

    log "[AudioElement] set_data", @data.src?


    if @src isnt @data.src
      @set_src @data.src
    else if @mobile_played and @is_playing
      @on_started()



  set_src: ( src ) ->
    # log "[AudioElement] set_src", src
    @info_loading_showed = false if src isnt @src 
      
    @src = src
    
    @dom.attr 'src', ''
    delay 1, => @dom.attr 'src', @src

  on_loaded_metadata: =>
    if @data.is_recorded
      # log "[AudioElement] [on loaded metadata]", @dom[0].duration
      @duration = @dom[0].duration
    else
      # log "[AudioElement] [on loaded metadata] it's a room!"
    @emit 'loaded', @duration

  on_paused: =>
    @is_playing = false
    # log "[AudioElement] [on paused]"
    @emit 'paused'
    clearInterval @timer_interval

  on_ended: =>
    @is_playing = false
    # log "[AudioElement] [on ended]"
    @emit 'ended'
    clearInterval @timer_interval

  on_started: =>
    @is_playing = true
    # @dom[0].volume = 0
    log "[AudioElement] [on started]"
    @emit 'started'

    @check_time()
    clearInterval( @timer_interval ) if @timer_interval
    @timer_interval = setInterval @check_time, 500


  mobile_play: ( src ) ->
    log "[AudioElement] mobile_play", src
    @src = src
    @dom.attr 'src', @src
    @mobile_played = true
    @play()


  play: ->
    # log "[AudioElement] play"
    @dom[0].play()
    @emit 'played'
    clearTimeout @loading_interval
    @loading_interval = setTimeout @check_playing, 3000

  check_playing: =>
    if !@is_playing
      @problems_with_playing()
    else
      # log "[Audio] no problems"

  problems_with_playing: ->
    # log "[Audio] problems_with_playing"
    if not @info_loading_showed
      # notify.info 'Loading the set is taking a while. Please wait or try again'
      @info_loading_showed = true
    
    # force reset as previous code doesn't seem to work
    $( 'audio' ).attr( "src", "" )

    delay 150, => 
      @set_src @src
      @play()



  get_time_from_perc: ( perc ) ->
    currentTime = @duration * perc

    time = time_to_string currentTime
    # log "get_time_from_perc", @duration, perc, currentTime, time
    return time


  pause: ->
    @dom[0].pause()
    clearTimeout @loading_interval

  toggle: ->
    if @is_playing
      @pause()
    else
      @play()

  snap_to: (perc) ->
    return if not @data.is_recorded

    
    log "[Audio] snap_to", perc, @duration * perc

    @snapping = true
    @dom[0].currentTime = @duration * perc

    if not @is_playing
      @play()


  destroy: ->
    @dom[0].removeEventListener 'loadedmetadata', @on_loaded_metadata
    @dom[0].removeEventListener 'playing', @on_started
    @dom[0].removeEventListener 'pause', @on_paused
    @dom[0].removeEventListener 'ended', @on_ended
    @dom = null

  check_time: =>

    if @data.is_recorded
      time = time_to_string @dom[0].currentTime

      data = 
        time: time
        perc: Math.min( 100, @dom[0].currentTime / @duration * 100 )

    else
      seconds = now_to_seconds @data.start_time
      time = time_to_string seconds

      data = 
        time: time

    # Trying to fix a Safari Bug
    if @snapping and @last_time isnt time
      @snapping = false
      @emit 'snapped'


    @last_time = time


    log "audio progress", "time", data.time, "perc", data.perc, "curr", @dom[0].currentTime, "dur", @duration
    @emit 'progress', data
    