user_controller = require 'app/controllers/user'

module.exports = class LoggedView

  constructor: ->
    view.on 'binded', @on_views_binded
    console.log "LOGGED VIEW CONSTRUCTOR"

  on_views_binded: (scope) =>
    log "#############", scope.main
    return unless scope.main

    user_controller.on 'user:logged', @on_user_logged
    user_controller.on 'user:unlogged', @on_user_unlogged
    user_controller.on 'user:updated', @on_user_updated

    user = user_controller.data

    if user
      @on_user_logged user
    else
      @on_user_unlogged()

  on_user_updated: ( @user_data ) =>

  on_user_logged: ( @user_data ) =>

  on_user_unlogged: =>

  destroy: =>
    user_controller.off 'user:logged', @on_user_logged
    user_controller.off 'user:unlogged', @on_user_unlogged    
    user_controller.off 'user:updated', @on_user_updated