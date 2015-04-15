appcast = require '../../controllers/appcast'

module.exports = ( dom ) ->

  appcast.on 'connected', ( is_connected ) ->

    if is_connected

      dom.hide()

    else

      dom.show()