user = require 'app/controllers/user'
L  = require 'app/api/loopcast/loopcast'
login_popup = require 'app/utils/login_popup'

module.exports = class FollowButton
  is_following: false
  user_id: null

  constructor: (@dom) ->
    @user_id = @dom.data 'user-id'
    return if not @user_id

    me = @

    user.on 'user:followed', @on_user_follow
    user.on 'user:unfollowed', @on_user_unfollow

    # L.user.following ( error, result ) ->
    #   log "[FollowButton] check", result

    #   if error
    #     console.error 'error checking for followers of #{@user_id}'

    #   # if owner_id is on the list of liked_ids
    #   following = ( result.indexOf( @user_id ) != -1 )

    #   if following
    #     me.dom.addClass( 'following' ).html( 'Unfollow' )
    #     me.is_following = true

    

    if user.data? and user.data.following?
      @check_following()
    else
      user.on 'following:loaded', @on_user_following_loaded
        
    @dom.on 'click', @toggle

    if user.is_me @user_id
      @dom.remove()
      return

  on_user_following_loaded: =>
    user.off 'following:loaded', @on_user_following_loaded
    @check_following()

  check_following: ->
    # log "[FollowButton] followed?", user.is_following( @user_id ), @user_id
    if user.is_following @user_id
      @on_user_follow @user_id 

  toggle: =>

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

  on_user_unfollow: (user_id) =>
    # log "[Follow] on_user_unfollow", user_id, @user_id
    return if user_id isnt @user_id

    # log "[FollowButton] unfollow", @user_id
    @dom.removeClass( 'following' ).html( 'Follow' )
    @is_following = false  

  on_user_follow: (user_id) =>
    # log "[Follow] on_user_follow", user_id, @user_id
    return if user_id isnt @user_id

    @dom.addClass( 'following' ).html( 'Unfollow' )
    @is_following = true


  unfollow: ->
    user.unfollow @user_id

  follow: ->
    # log "[FollowButton] follow", @user_id
    user.follow @user_id


  

  destroy: ->
    @dom.off 'click', @toggle    