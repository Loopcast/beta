module.exports = class TapeProgress
  
  tape_id: null
  source_src: null

  constructor: ( @dom ) ->
    @tape_id = @dom.data 'tape-id'
    @source = @dom.data 'source'
    @progress = @dom.find '.progress'
    @progress_parent = @dom.find '.inner'

    @progress_parent.on 'click', @on_progress_click
    app.on  'audio:started', @on_play
    app.on  'audio:paused', @on_stop
    app.on 'audio:ended', @on_end

  on_progress_click: (e) =>

    x = e.offsetX
    w = $(e.currentTarget).width()
    perc = x / w

    log "[TapeProgress] on_progress_click()", perc
    if not app.player.audio.is_playing
      app.player.play @tape_id, @source_src
      app.player.audio.once 'started', =>
        app.player.audio.snap_to perc
    else
      app.player.audio.snap_to perc

  on_play: (_tape_id) =>
    if _tape_id is @tape_id
      app.player.audio.on 'progress', @on_progress
    else
      @on_stop()

  on_stop: =>
    app.player.audio.off 'progress', @on_progress

  on_end: =>
    @progress.css 'width', 0

  on_progress: ( data ) =>
    @progress.css 'width', data.perc + "%"


  destroy: ->
    app.off 'audio:started', @on_play
    app.off 'audio:paused', @on_stop
    app.off 'audio:ended', @on_end