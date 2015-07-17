time_to_string = require 'app/utils/time/time_to_string'
now_to_seconds = require 'app/utils/time/now_to_seconds'
happens = require 'happens'

module.exports = class AudioElement
  timer_interval: null
  is_playing: false
  duration: 0
  last_time: ""
  snapping: false
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


  _log: (msg) ->
    return
    @debug.append "<p>#{msg}</p>"


  set_data: ( data ) ->
    return if @data.id is data.id

    @data = data

    @_log "set_data"
    log "[AudioElement] set_data", @data

    @set_src @data.src


  set_src: ( src ) ->
    if @dom.attr( 'src' ) isnt src
      @dom.attr 'src', src

  on_loaded_metadata: =>
    if @data.is_recorded
      @_log "on loaded metadata"
      log "[AudioElement] [on loaded metadata]", @dom[0].duration
      @duration = @dom[0].duration
    else
      log "[AudioElement] [on loaded metadata] it's live!"
    @emit 'loaded', @duration

  on_paused: =>
    @is_playing = false
    @_log "on paused"
    log "[AudioElement] [on paused]"
    @emit 'paused'
    clearInterval @timer_interval

  on_ended: =>
    @is_playing = false
    @_log "on ended"
    log "[AudioElement] [on ended]"
    @emit 'ended'
    clearInterval @timer_interval

  on_started: =>
    @is_playing = true
    # @dom[0].volume = 0
    @_log "on started"
    log "[AudioElement] [on started]"
    @emit 'started'

    @check_time()
    clearInterval( @timer_interval ) if @timer_interval
    @timer_interval = setInterval @check_time, 500

  play: ->
    @dom[0].play()
    @emit 'played'

  pause: ->
    @dom[0].pause()

  toggle: ->
    if @is_playing
      @pause()
    else
      @play()

  snap_to: (perc) ->
    return if not @data.is_recorded

    if not @is_playing
      @play()
    @snapping = true
    @dom[0].currentTime = @duration * perc


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



    @emit 'progress', data
    