parse_xml = require('xml2js').parseString

module.exports = ( mount_point, callback ) ->
    
  url = "#{s.radio.url}/admin/listclients?mount=/#{mount_point}"

  options =
    auth:
      user           : s.radio.user
      password       : s.radio.password
      # sendImmediately: off

  request url, options, ( error, response, body ) ->

    if error
      return reply Boom.resourceGone( "error getting stats")

    if response.statusCode is 401

      return reply Boom.resourceGone( "authentication with radio failed")

    console.log '--got body--'
    console.log body
    console.log '--end of body--'

    parse_xml body, ( error, result ) ->

      if error
        callback Boom.resourceGone( "error getting listeners")

      if not result.icestats? then return callback null, 0
      if not result.icestats.source? then return callback null, 0
      if not result.icestats.source[0].Listeners then return callback null, 0
        
      callback null, Number(result.icestats.source[0].Listeners[0])