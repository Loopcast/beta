appcast = require '../../../controllers/appcast'

module.exports = ( dom ) ->

  console.log "record! ->", dom

  dom.find( 'a' ).click ->

    console.log "clicked record!"
    
    return false