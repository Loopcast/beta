request = require 'request'
crypto  = require 'crypto'
moment  = require 'moment'

module.exports = ( url, stream_name, callback ) ->

  url         = "http://87.117.193.10:8000/;mp3"
  stream_name = "house-station-radio_house-station-radio"

  url         = "http://radio.loopcast.fm:8000/55b1168a215431030003730a"
  stream_name = "hems_jazz-and-work-with-mark"

  url                   = "https://api.acrcloud.com"
  
  account_access_key    = "8e52c2ba81bb2b26"
  account_access_secret = "0fab328b7561ce5a976a6a9d6ee32385"

  uri               = "/v1/monitors"
  http_method       = "POST"
  signature_version = "1"
  timestamp         = moment.utc().unix()

  string_to_sign  = ""
  string_to_sign += http_method        + "\n"
  string_to_sign += uri                + "\n"
  string_to_sign += account_access_key + "\n"
  string_to_sign += signature_version  + "\n"
  string_to_sign += timestamp

  console.log "will sign:", string_to_sign

  hash = crypto.createHmac( 'sha1', account_access_key )
  hash = hash.update( string_to_sign ).digest( "hex" )

  sign = new Buffer( hash ).toString('base64')

  headers = 
    'access-key'       : account_access_key 
    'signature-version': signature_version 
    'signature'        : sign
    'timestamp'        : timestamp

  console.log 'headers ->', headers
  
  data = 
    url          : url
    stream_name  : 'test'
    project_name : s.acrcloud.api.id


  options = 
    url    : "#{url}#{uri}"
    headers: headers
    form   : data

  req = request.post options, ( error, response, body ) ->

    if error
      console.log "ERROR!"
      console.log error
      console.error error

      return

    console.log 'success!!'
    console.log 'response ->', response

    callback?()

  hello: true