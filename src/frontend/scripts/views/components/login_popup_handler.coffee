login_popup = require 'app/utils/login_popup'

module.exports = ( dom ) ->
	dom.on 'click', -> 
    do login_popup
    return false

