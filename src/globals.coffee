global.s   = require './settings'

global.lib = ( path ) -> 
  require __dirname + "/lib/#{path}"

global.models = ( path ) -> 
  require __dirname + "/models/#{path}"

module.exports = global