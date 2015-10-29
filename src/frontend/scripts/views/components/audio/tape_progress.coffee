module.exports = class TapeProgress
  
  tape_id: null

  constructor: ( @dom ) ->
    @tape_id = @dom.data 'tape-id'
    @progress = @dom.find '.progress'
    app.on  'audio:started', @on_play
    app.on  'audio:paused', @on_stop

  on_play: (_tape_id) =>
    if _tape_id is @tape_id
      app.player.audio.on 'progress', @on_progress
    else
      @on_stop()

  on_stop: =>
    app.player.audio.off 'progress', @on_progress
    @progress.css 'width', "0%"

  on_progress: ( data ) =>
    @progress.css 'width', data.perc + "%"


  destroy: ->
    app.off 'audio:started', @on_play
    app.off 'audio:paused', @on_stop