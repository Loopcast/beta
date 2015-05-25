module.exports = class MobileFilter
  opened: false
  constructor: (@dom) ->
    @dom.on 'click', @toggle
    @list = $ '.genres_list'
    @content = $ '.rooms_grid'
    @list.on 'click', 'a', @close

  toggle: =>
    if @opened
      @close()
    else
      @open()

  close: =>
    @opened = false
    
    @dom.removeClass 'mobile_opened'
    @list.removeClass 'mobile_opened'
    @content.removeClass 'loading_visible_2'
    @content.removeClass 'loading_visible_1'


  open: ->
    @opened = true
    @dom.addClass 'mobile_opened'
    @list.addClass 'mobile_opened'
    @content.addClass 'loading_visible_1'

    delay 1, => @content.addClass 'loading_visible_2'
