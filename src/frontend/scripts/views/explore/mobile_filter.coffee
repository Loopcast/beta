module.exports = class MobileFilter
  opened: false
  constructor: (@dom) ->
    @dom.on 'click', @toggle
    @list = $ '.genres_list'

  toggle: =>
    if @opened
      @close()
    else
      @open()

  close: ->
    @opened = false
    @dom.removeClass 'mobile_opened'
    @list.removeClass 'mobile_opened'

  open: ->
    @opened = true
    @dom.addClass 'mobile_opened'
    @list.addClass 'mobile_opened'
