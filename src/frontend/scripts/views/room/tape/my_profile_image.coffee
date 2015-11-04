LoggedView  = require 'app/views/logged_view'
transform   = require 'lib/cloudinary/transform'
get_coords  = require 'app/utils/io/get_coords' 

module.exports = class MyProfileImage extends LoggedView
  original_src: null
  user_logged : false
  constructor: (@dom) ->
    super @dom
    @image = @dom.find 'img'
    @original_src = @image.attr 'src'

  on_user_logged: ( @user_data ) =>
    return if @user_logged
    @user_logged = true
    log "[MyProfileImage] on_user_logged", @user_data

    @image.attr 'src', transform.avatar( @user_data.avatar )

    @popup ?= view.get_by_dom '.chat_user_popup'

    @dom.on 'mouseover', @_on_people_over
    @dom.on 'mouseout', @_on_people_out

  on_user_unlogged: =>
    return if not @user_logged
    @user_logged = false
    log "[MyProfileImage] on_user_unlogged"
    @image.attr 'src', @original_src

    @dom.off 'mouseover', @_on_people_over
    @dom.off 'mouseout', @_on_people_out

  _on_people_over: (e) =>
    coords = get_coords e
    @popup.show @user_data._id, coords

  _on_people_out: =>
    @popup.hide()


  destroy: ->
    @popup = null
    if @user_logged
      @dom.on 'mouseover', @_on_people_over
      @dom.on 'mouseout', @_on_people_out



