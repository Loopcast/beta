module.exports = ( url, callback ) ->

  data =
    url: s.facebook.graph.plain
    form:
      id     : url
      scrape : true

  request.post data, ( error, response, body ) ->

    body = JSON.parse( body )

    if body.error
      console.log "error scraping facebook url #{url}"
      console.log "body.error: ", body.error

    callback? error, response, body