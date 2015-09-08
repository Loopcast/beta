module.exports =
  method: [ 'GET' ]
  path   : '/api/v1/stream/audiopump/listener_remove'

  config:

    description: "Callback by icecast server when a listener stop streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      path = req.payload.data.path.split( "/" )[1]
      ip   = req.payload.data.requestHeaders.host

      console.log '- audiopump/listener_remove'

      console.log 'path: ', path
      console.log 'ip  : ', ip

      console.log '- - -'
      console.log 'new header!'
      console.log '- - -'
      

      reply()

      return