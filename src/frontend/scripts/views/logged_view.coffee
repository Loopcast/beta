user_controller = require 'app/controllers/user'

module.exports = class LoggedView

  on_views_binded: =>
    user_controller.on 'user:logged', @on_user_logged
    user_controller.on 'user:unlogged', @on_user_unlogged

    user = user_controller.get_user()
    if user
      @on_user_logged( user )
    else
      @on_user_unlogged()

  on_user_logged: ( user_data ) =>

  on_user_unlogged: =>

  destroy: =>
    user_controller.off 'user:logged', @on_user_logged
    user_controller.off 'user:unlogged', @on_user_unlogged    
