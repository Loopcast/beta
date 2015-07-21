parse_xml = require('xml2js').parseString

module.exports = ( room_id, callback ) ->
    
  redis.get "#{room_id}:listeners", ( error, buffer ) ->

    if buffer? 
      buffer = Number buffer.toString()
    else
      buffer = 0

    callback error, buffer