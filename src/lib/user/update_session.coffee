module.exports = ( request, user ) ->

  # NOTE: might not be good idea to save user_id on the session
  # let's not print this on the source code, so user can never
  # figure out other user database _id !
  user.info._id        = user._id
  user.info.created_at = user.created_at
  user.info.email      = user.data.email

  request.auth.session.set user: user.info