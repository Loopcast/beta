parse_xml = require('xml2js').parseString

module.exports = ( mount_point, metadata, callback ) ->
    
  url = "#{s.radio.url}:8000/admin/metadata?mount=/#{mount_point}&mode=updinfo"

  url += "&genres=#{metadata.genres}"
  url += "&title=#{metadata.title}"
  url += "&description=#{metadata.description}"
  url += "&song=#{metadata.url}"

  options =
    auth:
      user           : s.radio.user
      password       : s.radio.password
      sendImmediately: off

  request url, options, ( error, response, body ) ->

    if error
      console.log "error updating metadata for #{mount_point}"
      console.log error

    if response.statusCode isnt 401 and response.statusCode isnt 200
      
      console.log "error updating metadata for #{mount_point}"
      console.log 'status error code:', response.statusCode
      console.log body

    # always callback, even if no succesful.
    # this functionality isn't really essential
    callback? null