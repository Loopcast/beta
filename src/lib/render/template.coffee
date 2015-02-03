###

Try to find a jade file on ./src/views/templates/#{url}
if suceeds replies passing rendered file back
if fails calls callback with error true


###

fs   = require 'fs'
path = require 'path'
jade = require 'jade'

module.exports = ( url, callback ) ->

  root = path.join( __dirname + '/../../views/templates' )

  url  = root + url + '.jade'


  fs.exists url, ( exists ) ->


    if not exists then callback error = true
      
    callback null, jade.renderFile url, hello: 'world!' 