###

Try to find a jade file on ./src/views/templates/#{url}
if suceeds replies passing rendered file back
if fails calls callback with error true


###

fs   = require 'fs'
path = require 'path'
jade = require 'jade'

module.exports = ( url, data, callback ) ->

  root = path.join( __dirname + '/../../views/templates' )

  url  = root + url + '.jade'

  fs.readFile url, ( error, content ) ->

    if error then return callback error

    template = jade.compile content,
      filename    : url
      compileDebug: on
      pretty      : on

    callback null, template data