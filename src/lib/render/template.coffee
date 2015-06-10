###

Try to find a jade file on ./src/frontend/templates/#{url}
if suceeds replies passing rendered file back
if fails calls callback with error true


###

fs   = require 'fs'
path = require 'path'
jade = require 'jade'

cloudinary_transform = lib 'cloudinary/transform'

module.exports = ( url, data = {}, callback ) ->

  data.cloudinary = 
    api_key     : s.cloudinary.api_key
    cloud_name  : s.cloudinary.cloud_name
    unsigned_ids: s.cloudinary.api_unsigned_ids

  data.pusher =
    key: s.pusher.key

  data.intercom =
    id: s.intercom.id

  data.fb_app_id = s.facebook.client_sdk_id

  data.transform = cloudinary_transform

  root = path.join( __dirname + '/../../frontend/templates' )

  url  = root + url + '.jade'

  fs.readFile url, ( error, content ) ->

    if error then return callback error

    try
      template = jade.compile content,
        filename    : url
        compileDebug: on
        pretty      : on      
    catch e
      # comment this try catch if you want to see the original error
      console.error 'error compiling jade template'
      console.error e

      return callback e, null


    callback null, template data