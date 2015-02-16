cloudinary  = require 'cloudinary'
querystring = require 'querystring'
crypto      = require 'crypto'
moment      = require 'moment'
module.exports = ( image_id, callback ) ->
  ###
  Create the signature for direct upload on cloudinary
  and return the object required by the documentation

  docs: 
  http://cloudinary.com/documentation/upload_images#request_authentication
  http://cloudinary.com/documentation/jquery_image_upload#direct_uploading_environment_setup
  ###

  data = 
    public_id : image_id
    timestamp : moment().format('X')


  # TEMP: fake data
  # s.cloudinary.api_secret = 'abcd'
  # s.cloudinary.api_key = '1234'

  # data.timestamp = '1315060510'
  # data.public_id = 'sample'

  serialized = querystring.stringify data
  serialized += s.cloudinary.api_secret

  hash = crypto.createHash('sha1')
  hash.update serialized

  callback 
    # "public_id" : data.public_id
    "timestamp" : data.timestamp
    "callback"  : "http://localhost:1993/cloudinary_cors.html"
    "signature" : hash.digest( 'hex' )
    "api_key"   : s.cloudinary.api_key