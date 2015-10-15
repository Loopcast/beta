module.exports = ( request, user ) ->

  # NOTE: might not be good idea to save user_id on the session
  # let's not print this on the source code, so user can never
  # figure out other user database _id !
  user.info._id        = user._id
  user.info.created_at = user.created_at
  user.info.email      = user.data.email

  delete user.info.about
  delete user.info.social
  delete user.info.location
  delete user.info.genres
  delete user.info.occupation
  
  request.auth.session.set user: user.info