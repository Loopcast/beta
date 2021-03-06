###
# Transforms facebook information into session information
###


hash    = lib 'tools/hash'
graph   = lib 'facebook/call_graph'
upload  = lib 'cloudinary/upload'

transform = models 'transforms/name_to_username'

# args
#  - "info" is the information received from facebook
#  - "callback" standard node callback
module.exports = ( info, callback ) ->

  after_upload = ( picture_info ) ->

    transform info.profile.displayName, true, ( error, username ) ->

      user = 
        info :
          username: username
          name    : info.profile.displayName
          # avatar : picture_info.secure_url
        data :
          # email   : info.profile.email
          facebook: 
            id   : info.profile.id
            # email: info.profile.email

      if picture_info
        user.info.avatar = picture_info.secure_url

      if info.profile.email

        user.data.email          = info.profile.email
        user.data.facebook.email = info.profile.email

      callback null, user

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


  # TODO: delete this picture from cloudinary in case user upload a new one
  # TODO: don't upload in case picture url did not change
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