###

Try to find a jade file on ./src/frontend/templates/#{url}
if suceeds replies passing rendered file back
if fails calls callback with error true


###

fs   = require 'fs'
path = require 'path'
jade = require 'jade'

cloudinary_transform = lib 'cloudinary/transform'
autolink = lib 'tools/strings/autolink'
strip_tags = lib 'tools/strings/strip_tags'

module.exports = ( url, data = {}, callback ) ->

  data.cloudinary = 
    api_key     : s.cloudinary.api_key
    cloud_name  : s.cloudinary.cloud_name
    unsigned_ids: s.cloudinary.api_unsigned_ids

  data.intercom =
    id: s.intercom.id

  data.is_beta  = s.is_beta
  data.is_local = s.is_local

  data.fb_app_id = s.facebook.client_sdk_id

  data.transform = cloudinary_transform
  data.autolink = autolink
  data.strip_tags = strip_tags

  data.s3 =
    bucket: s.s3.bucket
    key   : s.s3.key

  data.slugify = (str) -> str.split( " " ).join( "-" )

  root = path.join( __dirname + '/../../templates' )

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