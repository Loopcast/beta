cloudinary = require 'cloudinary'

module.exports = ( url, data, callback ) ->

  after_upload = ( result ) ->

    if result.error?
      # create an Error object so that we get a stack trace if we need
      message = "#{result.error.message}, #{url}"

      return callback new Error message

    callback null, result

  cloudinary.uploader.upload url, after_upload, data