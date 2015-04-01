###
# on the browser, window is the global holder
###

# utils

window.delay = require './globals/delay'

window.interval  = require './globals/interval'

window.log   = require './globals/log'

window.mover = require './globals/mover'

# widely used modules

window.happens = require 'happens'

window.api = 
  loopcast: require './api/loopcast/loopcast'

module.exports = window