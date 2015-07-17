module.exports = class TagsViewer
  constructor: (@dom) ->
    @tags = @dom.find 'list'
    @parent = @dom.parent()

    @dom.on 'mouseenter', @open
    @dom.on 'mouseleave', @close

  open: =>
    @parent.addClass 'tags_visible'

  close: =>
    @parent.removeClass 'tags_visible'


  destroy: =>
    @dom.off 'mouseenter', @open    
    @dom.off 'mouseleave', @close