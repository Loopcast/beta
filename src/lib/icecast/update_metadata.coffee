parse_xml = require('xml2js').parseString

module.exports = ( mount_point, metadata, callback ) ->
    
  url = "#{s.radio.url}/admin/metadata?mount=/#{mount_point}&mode=updinfo"

  url += "&genres=#{metadata.genres}"
  url += "&title=#{metadata.title}"
  url += "&description=#{metadata.description}"
  url += "&song=#{metadata.url}"

  console.log "url ->", url

  options =
    auth:
      user           : s.radio.user
      password       : s.radio.password
      sendImmediately: off

  request url, options, ( error, response, body ) ->

    if error
      console.log "error updating metadata for #{mount_point}"
      console.log error

    if response.statusCode isnt 401
      console.log "error updating metadata for #{mount_point}"
      console.log body

    console.log "success updating meta data"

    # always callback, even if no succesful.
    # this functionality isn't really essential
    callback? null