#
# ~ Returns md5 hash for given string
#

crypto = require('crypto')

module.exports = ( value ) ->

  crypto
    .createHash('md5')
    .update( value )
    .digest("hex")