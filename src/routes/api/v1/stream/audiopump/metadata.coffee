module.exports =
  method: [ 'GET' ]
  path   : '/api/v1/stream/audiopump/metadata'

  config:

    description: "Callback by icecast server when a metadata changes"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      console.log '- audiopump/metadata'
      console.log req.payload.timeStamp
      console.log req.payload.data
      console.log '- - -'

      reply()