global.s   = require './settings'

global.lib = ( path ) -> require __dirname + "/lib/#{path}"

module.exports = global