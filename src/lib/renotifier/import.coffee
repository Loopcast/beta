module.exports = ( facebook_id, callback ) ->

  data =
    url                : s.renotifier.api.url

    rejectUnauthorized : false
    strictSSL          : false

    headers :
      Authorization  : "Token #{s.renotifier.api.token}"
    
    form:
      facebook_app_id: s.facebook.app.id
      facebook_ids   : facebook_id

  request.post data, ( error, response, body ) ->

    console.log "got response!"

    if error or response.statusCode != 200

      console.log "error importing user to renotifier"
      console.log '---'
      console.log body
      console.log '---'

      return callback? error

    # JSON from tape server
    # body = JSON.parse body

    # console.log 'response from renotifier ->', body