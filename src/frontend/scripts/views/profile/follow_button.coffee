user = require 'app/controllers/user'
L  = require 'app/api/loopcast/loopcast'

module.exports = class FollowButton
  is_following: false

  constructor: (@dom) ->
    @username_to_follow = @dom.data 'user-id'
    return if not @username_to_follow

    
    user.check_following [ @username_to_follow ], (data) =>
      # log "[FollowButton] got response", data

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

    user_id = $( '#owner_id' ).val()

    L.user.unfollow user_id, ( error, result ) ->

      if error
        console.error 'error following #{user_id}'

      console.info "following #{user_id}!"

  follow: ->
    @dom.addClass( 'following' ).html( 'Unfollow' )
    @is_following = true

    user_id = $( '#owner_id' ).val()

    console.log "calling following for #{user_id}"

    L.user.follow user_id, ( error, result ) ->

      if error
        console.error 'error following #{user_id}'

      console.info "following user_id!"
    

  destroy: ->
    @dom.off 'click', @toggle    