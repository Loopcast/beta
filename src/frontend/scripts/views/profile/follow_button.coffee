user = require 'app/controllers/user'
L  = require 'app/api/loopcast/loopcast'

module.exports = class FollowButton
  is_following: false

  constructor: (@dom) ->
    @username_to_follow = @dom.data 'user-id'
    return if not @username_to_follow

    me = @

    user_id = $( '#owner_id' ).val()

    L.user.following ( error, result ) ->
      log "[FollowButton] check", result

      if error
        console.error 'error checking for followers of #{user_id}'

      # if owner_id is on the list of liked_ids
      following = ( result.indexOf( user_id ) != -1 )

      if following
        me.dom.addClass( 'following' ).html( 'Unfollow' )
        me.is_following = true


    @dom.on 'click', @toggle

    if user.is_me @username_to_follow
      @dom.remove()
      return


  toggle: =>

    if @is_following
      @unfollow()
    else
      @follow()

    # so it doesn't add # to the url
    return false

  unfollow: ->
    log "[FollowButton] unfollow"
    @dom.removeClass( 'following' ).html( 'Follow' )
    @is_following = false

    user_id = $( '#owner_id' ).val()

    L.user.unfollow user_id, ( error, result ) ->
      log "[FollowButton] unfollow response", result
      if error
        console.error 'error following #{user_id}'

  follow: ->
    log "[FollowButton] follow"
    @dom.addClass( 'following' ).html( 'Unfollow' )
    @is_following = true

    user_id = $( '#owner_id' ).val()

    L.user.follow user_id, ( error, result ) ->
      log "[FollowButton] follow response", result
      if error
        console.error 'error following #{user_id}'


  destroy: ->
    @dom.off 'click', @toggle    