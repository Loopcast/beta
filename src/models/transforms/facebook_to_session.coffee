###
# Transforms facebook information into session information
###

request = require 'request'
hash    = lib 'tools/hash'
graph   = lib 'facebook/call_graph'
upload  = lib 'cloudinary/upload'

module.exports = ( info, callback ) ->

  console.log "facebook information ->"
  console.log info


  after_upload = ( picture_info ) ->

    username = info.profile.email
    username = username.substr 0, username.indexOf '@'

    session = 
      username: username
      name    : info.profile.displayName

    console.log "picture info ->", picture_info

    callback null, session

  ###
  # fetch large profile picture from facebook and upload to cloudinary
  # if image fails, after_upload will receive null
  # if image succeed, after_upload will receive cloudinary photo information
  ###

  avatar =
    url: "/#{info.profile.id}/picture"
    id : "fb:#{info.profile.id}"

  avatar.hash = hash avatar.id

  params =
    access_token: info.token
    type        : 'large'
    redirect    : false

  graph avatar.url, params, ( error, response ) ->

    # if fails to fetch facebook profile image
    # or if image is default silhouette
    if error or response.data.is_silhouette
      # - use the default avatar image

      return after_upload()

    avatar.url = response.data.url

    data = 
      public_id: avatar.hash
      overwrite: on

    upload avatar.url, data, ( error, result ) ->

      if error
        # - use the default avatar image

        return after_upload()

      after_upload result