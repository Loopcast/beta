LoggedView  = require 'app/views/logged_view'
transform   = require 'lib/cloudinary/transform'

module.exports = class MyProfileImage extends LoggedView
  original_src: null
  constructor: (@dom) ->
    super @dom
    @image = @dom.find 'img'
    @original_src = @image.attr 'src'

  on_user_logged: ( @user_data ) =>
    log "[MyProfileImage] on_user_logged", @user_data

    @image.attr 'src', transform.avatar( @user_data.avatar )

  on_user_unlogged: =>
    log "[MyProfileImage] on_user_unlogged"
    @image.attr 'src', @original_src