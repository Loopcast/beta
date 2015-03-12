appcast = require '../../../controllers/appcast'

module.exports = ( dom ) ->

  dom.find('a').click ->

    console.log "clicked go live!"

    appcast.start_stream()

    return false