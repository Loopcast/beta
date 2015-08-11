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
    console.log '-> ', response.statusCode

    if error

      console.log "error importing user to renotifier"
      console.log '---'
      console.log body
      console.log '---'

      return callback? error

    else

      console.log '---'
      console.log body
      console.log '---'

      callback null

    # JSON from tape server
    # body = JSON.parse body

    # console.log 'response from renotifier ->', body

  null