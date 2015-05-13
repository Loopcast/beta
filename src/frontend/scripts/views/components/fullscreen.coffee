module.exports = class Fullscreen
  factor: 1
  min_height: 500

  constructor: ( @dom ) ->
    @dom.addClass 'fullscreen'
    if @dom.data 'factor'
      @factor = @dom.data 'factor'

    app.window.on 'resize', @on_resize
    do @on_resize

  on_resize: ( ) =>
    h = (app.window.h - app.settings.header_height)*@factor

    h = Math.max @min_height, h
    @dom.css
      'width' : '100%'
      'height' : h


  destroy: ->
    @on_resize = ->
    app.window.off 'resize', @on_resize   
