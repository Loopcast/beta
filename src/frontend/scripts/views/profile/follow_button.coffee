user = require 'app/controllers/user'
L  = require 'app/api/loopcast/loopcast'

module.exports = class FollowButton
  is_following: false
  user_id: null

  constructor: (@dom) ->
    @user_id = @dom.data 'user-id'
    return if not @user_id

    me = @

    # L.user.following ( error, result ) ->
    #   log "[FollowButton] check", result

    #   if error
    #     console.error 'error checking for followers of #{@user_id}'

    #   # if owner_id is on the list of liked_ids
    #   following = ( result.indexOf( @user_id ) != -1 )

    #   if following
    #     me.dom.addClass( 'following' ).html( 'Unfollow' )
    #     me.is_following = true

    

    if user.following?
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
    log "[FollowButton] followed?", user.is_following( @user_id), @user_id
    if user.is_following( @user_id )
      @_follow()


  toggle: =>

    if @is_following
      @unfollow()
    else
      @follow()

    # so it doesn't add # to the url
    return false

  unfollow: ->
    log "[FollowButton] unfollow", @user_id
    @dom.removeClass( 'following' ).html( 'Follow' )
    @is_following = false


    L.user.unfollow @user_id, ( error, result ) ->
      log "[FollowButton] unfollow response", result
      if error
        console.error 'error following #{@user_id}'

  follow: ->
    log "[FollowButton] follow", @user_id
    
    @_follow()
    L.user.follow @user_id, ( error, result ) ->
      log "[FollowButton] follow response", result
      if error
        console.error 'error following #{@user_id}'

  _follow: ->
    @dom.addClass( 'following' ).html( 'Unfollow' )
    @is_following = true

  destroy: ->
    @dom.off 'click', @toggle    