module.exports = ( id, callback ) ->

  url = "#{s.radio.url}:8001/add/#{id}"

  request.get url, ( error, response, body ) ->

    if error
      console.error "error creating mount point @ radio server"
    
      return callback error

    if response.statusCode isnt 200
      return callback 'not_200', response.statusCode

    callback? error, body