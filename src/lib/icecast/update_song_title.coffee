parse_xml = require('xml2js').parseString

http://radio.loopcast.fm:8000/admin/?mount=/5583d292f191b70300dbaeda&mode=updinfo&song=thomas

module.exports = ( mount_point, song_title, callback ) ->
    
  url = "#{s.radio.url}/admin/metadata?mount=/#{mount_point}&mode=updinfo&song=#{song_title}"

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

    # always callback, even if no succesful.
    # this functionality isn't really essential
    callback null