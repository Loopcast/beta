###
# Transforms facebook information into session information
###

module.exports = ( info, callback ) ->

  console.log "facebook information ->"
  console.log info

  username = info.profile.email
  username = username.substr 0, username.indexOf '@'

  session = username: username

  callback null, session