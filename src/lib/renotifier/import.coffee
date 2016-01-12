module.exports = ( facebook_id, callback ) ->

  data =
    url                : s.renotifier.api.url + '/import'

    rejectUnauthorized : false
    strictSSL          : false

    headers :
      Authorization  : "Token #{s.renotifier.api.token}"
    
    form:
      facebook_app_id: s.facebook.app.id
      facebook_ids   : facebook_id

  request.post data, ( error, response, body ) ->

    if error or response.statusCode != 201

      console.log "error importing user to renotifier"
      console.log "statusCode: #{response.statusCode}"
      console.log '---'
      console.log body
      console.log '---'

      return callback? error

    else

      console.log '---'
      console.log body
      console.log '---'

      callback? null

  null