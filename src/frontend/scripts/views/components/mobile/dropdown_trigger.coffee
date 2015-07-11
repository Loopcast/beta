navigation = require 'app/controllers/navigation'
user_controller = require 'app/controllers/user'

module.exports = class DropdownTrigger
  opened: false
  constructor: ( @dom ) ->
    @dom.on 'click', @toggle
    @dropdown = $ @dom.data( 'dropdown' )
    @dropdown.on 'click', @close
    user_controller.on 'user:logged', @on_user_logged
    user_controller.on 'user:unlogged', @on_user_unlogged
    navigation.on 'dropdown:request_close', @close
    app.on 'mobile_dropdown:opened', @on_mobile_dropdown_opened

  on_mobile_dropdown_opened: (uid) =>
    if uid isnt @uid
      @close()

  on_user_logged: =>
    @close()

  on_user_unlogged: =>
    @close()

  toggle: =>
    if @opened
      @close()
    else
      @open()

  close: =>
    return if not @opened
    @opened = false

    app.emit 'mobile_dropdown:closed', @uid
    
    app.body.removeClass 'mobile_dropdown_opened_2'

    delay 200, =>
      app.body.removeClass 'mobile_dropdown_opened'
      @dom.removeClass 'mobile_opened'
      @dropdown.removeClass 'mobile_opened'

  open: ->
    return if @opened
    @opened = true

    app.emit 'mobile_dropdown:opened', @uid

    @dom.addClass 'mobile_opened'
    @dropdown.addClass 'mobile_opened'
    app.body.addClass 'mobile_dropdown_opened'
    delay 1, => app.body.addClass 'mobile_dropdown_opened_2'

  destroy: ->
    @dom.off 'click', @toggle
    @dropdown.off 'click', @close
    user_controller.off 'user:logged', @on_user_logged
    user_controller.off 'user:unlogged', @on_user_unlogged
    navigation.off 'dropdown:request_close', @close
    app.off 'mobile_dropdown:opened', @on_mobile_dropdown_opened