###
# on the browser, window is the global holder
###

# utils

window.delay = require './globals/delay'

window.interval  = require './globals/interval'

# polvo:if ENV = production
window.log = ->
# polvo:else
window.log   = require './globals/log'
# polvo:fi

window.mover = require './globals/mover'

window.slugify = (str) -> str.split( " " ).join( "-" )

# widely used modules

window.happens = require 'happens'

window.api = 
  loopcast: require './api/loopcast/loopcast'

module.exports = window