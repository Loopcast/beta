# TODO: check if username already exists ( and is from another user )
# if so, then create something like -2/-3 [...]

module.exports = ( name, add_random_number, callback ) ->

  # slug and force lowercase
  username  = slug name

  if add_random_number
    # adds random number to username
    # useful when signing up so we don't get two users with same username
    username += parseInt( Math.random() * 100 )

  callback null, username