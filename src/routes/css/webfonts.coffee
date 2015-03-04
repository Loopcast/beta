###

Compiles a stylus file and return a compiled css file

###

fs     = require 'fs'
path   = require 'path'

module.exports = 

  method: 'GET'
  path  : '/css/webfonts/{path*}'
  handler: 
    directory:
      path: root + '/www/css/webfonts/'