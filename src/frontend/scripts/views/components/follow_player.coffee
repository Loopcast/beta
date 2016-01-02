tmpl = require 'client_templates/components/follow_player'
transform = require 'lib/cloudinary/transform'
user = require 'app/controllers/user'
module.exports = class FollowPlayer
  data : null
  constructor: ( @dom ) ->
    @dom.find( '.close_follow_player' ).on 'click', @hide
    # @dom.on 'click', '.follow_button', @hide
    user.on 'user:followed', @on_user_followed

  on_user_followed: ( user_id ) =>
    if @data? and user_id is @data.user._id
      @hide()

  show: ( data ) ->

    if user.is_me data.user._id
      log "[FollowPlayer] returning. it's me!", data.user._id
      return

    if user.is_following data.user._id
      log "[FollowPlayer] returning. already following!", data.user._id  
      return

    log "[FollowPlayer] show", data
    
    @dom.addClass 'show_1'

    @data = data

    delay 10, =>
      @dom.addClass 'show_2'
      @dom.find('.inner').empty().append tmpl( 
        url: "/" + data.user.info.username
        image: transform.avatar data.user.info.avatar
        name: data.user.info.name
        occupation: data.user.info.occupation[ 0 ]
        user_id: data.user._id
       )

      delay 10, =>
        log "[VIEWS] --- binding"
        view.bind @dom.find('.inner')


  hide: =>
    @dom.removeClass 'show_2'
    delay 300, => 
      @dom.removeClass 'show_1'
