slug    = require 'slug'

# TODO: check if username already exists ( and is from another user )
# if so, then create something like -2/-3 [...]

module.exports = ( name, callback ) ->

  # remove white spaces
  username = name.replace /\s/g, ''

  # slug and force lowercase
  username = slug username.toLowerCase()

  callback null, username