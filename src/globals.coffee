path  = require 'path'

global.s  = require './settings'

global.lib = ( path ) -> 
  require __dirname + "/lib/#{path}"

global.models = ( path ) -> 
  require __dirname + "/models/#{path}"

global.www = ( path ) -> __dirname + "/../www/#{path}"
  

global.root = path.join( __dirname + "/.."  )

module.exports = global