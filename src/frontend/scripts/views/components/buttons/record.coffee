appcast = require '../../../controllers/appcast'

module.exports = ( dom ) ->

  dom.find( 'a' ).click ->

    console.log "clicked record!"
    
    return false