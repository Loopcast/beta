# TODO: this and get_access_token and extend_user_token are very similar
# we could probably combine them to avoide code duplication
# the difference is that in get_access_token and extend_user_token 
# we only need to JSON.parse the body if the response was not 200
# ( to get error info in case )

request = require 'request'
encode  = lib 'tools/encode_url_params'

module.exports = ( url, params, callback ) ->
  
  url = "#{s.facebook.graph.url}#{url}"

  if typeof( params ) is 'function'
    callback = params
  else
    url += "?#{encode params}"

  options = 
    method: 'get',
    uri   : url
    pool  : s.facebook.pool
    strictSSL: off

  request options, ( error, response ) ->
    # request returns Error object so we just pass it back up the call chain 
    if error then return callback error

    # parse facebook response
    try
      body = JSON.parse response.body
    catch error
      return callback error

    # check for errors on facebook response 
    if body.error?

      error          = new Error body.error.message
      error.type     = body.error.type
      error.code     = body.error.code
      error.fb_error = true
      error.fb_info  = uri : options.uri

      return callback error

    callback null, body
    
