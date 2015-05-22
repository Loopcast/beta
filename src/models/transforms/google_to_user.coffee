###
# Transforms facebook information into session information
###


hash    = lib 'tools/hash'
upload  = lib 'cloudinary/upload'

transform = models 'transforms/name_to_username'

# args
#  - "info" is the information received from facebook
#  - "callback" standard node callback
module.exports = ( info, callback ) ->

  after_upload = ( picture_info ) ->

    transform info.profile.displayName, ( error, username ) ->

      user = 
        info :
          username: username
          name    : info.profile.displayName
          avatar  : picture_info.secure_url

        data :
          email  : info.profile.email
          google :
            id     : info.profile.id
            email  : info.profile.email


      callback null, user

  ###
  # fetch large profile picture from facebook and upload to cloudinary
  # if image fails, after_upload will receive null
  # if image succeed, after_upload will receive cloudinary photo information
  ###

  avatar = 
    id : "gp:#{info.profile.id}"
    url: info.profile.raw.picture

  avatar.hash = hash avatar.id

  data = 
    public_id: avatar.hash
    overwrite: on

  upload avatar.url, data, ( error, result ) ->

    if error
      # - use the default avatar image

      return after_upload()

    after_upload result