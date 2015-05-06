cloudinary = require 'cloudinary'

module.exports = ( id, callback ) ->

  cloudinary.api.delete_resources [].concat( id ), ( result ) ->

    if result.error? then return callback result.error

    callback null, result