user = require 'app/controllers/user'
L  = require 'app/api/loopcast/loopcast'
login_popup = require 'app/utils/login_popup'

module.exports = class FollowButton
  is_following: false
  user_id: -1
  is_guest: false

  constructor: (@dom) ->
    id = @dom.data 'user-id'
    if id
      @user_id = id
    
    # log "[FollowButton] constructor", @user_id

    @dom.on 'click', @toggle

    # return if not @user_id

    me = @

    user.on 'user:followed', @on_user_follow
    user.on 'user:unfollowed', @on_user_unfollow

    if user.data? and user.data.following?
      @check_following()
    else
      user.on 'following:loaded', @on_user_following_loaded
        
    

    if user.is_me @user_id
      @dom.hide()
      return

  on_user_following_loaded: =>
    user.off 'following:loaded', @on_user_following_loaded
    @check_following()

  check_following: ->
    # log "[FollowButton] followed?", user.is_following( @user_id ), @user_id
    if user.is_me( @user_id ) or @is_guest
      @dom.hide()

    else

      @dom.show()

      if user.is_following @user_id
        @on_user_follow @user_id 
      else
        @on_user_unfollow @user_id

  toggle: =>

    # log "[FollowButton] toggle"

    if user.is_logged()
      @_toggle()
    else
      app.settings.after_login_url = location.pathname
      app.settings.action = 
        type: "follow"
        user_id: @user_id

      do login_popup



  _toggle: ->

    if @is_following
      @unfollow()
    else
      @follow()

    # so it doesn't add # to the url
    return false

  set_user_id: ( user_id, is_guest = false ) ->
    # log "[FollowButton] set_user_id", user_id, @user_id
    prev_id = @user_id
    @user_id = user_id
    @is_guest = is_guest

    if prev_id isnt @user_id
      # log "[FollowButton] check_following"
      @check_following()

  on_user_unfollow: (user_id) =>
    return if user_id isnt @user_id
    log "[Follow] on_user_unfollow", user_id, @user_id

    @set_state false

  on_user_follow: (user_id) =>
    return if user_id isnt @user_id
    log "[Follow] on_user_follow", user_id, @user_id

    @set_state true


  unfollow: ->
    # log "[FollowButton] unfollow"
    user.unfollow @user_id
    @set_state false

  follow: ->
    # log "[FollowButton] follow", @user_id
    user.follow @user_id
    @set_state true

  ###
  set the appearance of the dom element
  state = true # followed
  state = false # unfollowed
  ###
  set_state: ( state ) ->

    return if @is_following is state

    if state
      @dom.addClass( 'following' ).html( 'Unfollow' )
    else
      @dom.removeClass( 'following' ).html( 'Follow' )

    @is_following = state
  

  destroy: ->
    @dom.off 'click', @toggle    