module.exports = (dom) ->
  username_to_follow = dom.data 'user-id'
  log "[FollowButton]", username_to_follow