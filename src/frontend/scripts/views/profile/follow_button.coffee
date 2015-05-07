user = require 'app/controllers/user'
module.exports = class FollowButton
  is_following: false

  constructor: (@dom) ->
    @username_to_follow = @dom.data 'user-id'
    return if not @username_to_follow

    
    user.check_following [ @username_to_follow ], (data) =>
      log "[FollowButton] got response", data

    @dom.on 'click', @toggle

    if user.is_me @username_to_follow
      @dom.remove()
      return


  toggle: =>
    if @is_following
      @unfollow()
    else
      @follow()

  unfollow: ->
    @dom.removeClass( 'following' ).html( 'Follow' )
    @is_following = false

  follow: ->
    @dom.addClass( 'following' ).html( 'Unfollow' )
    @is_following = true

  destroy: ->
    @dom.off 'click', @toggle    