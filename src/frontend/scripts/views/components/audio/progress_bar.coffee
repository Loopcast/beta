module.exports = class ProgressBar
  constructor: ( @dom ) ->
    view.once 'binded', @on_views_binded
    
  on_views_binded: =>
    @parent = view.get_by_dom '#player'
    @audio = @parent.audio
    
