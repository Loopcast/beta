# TODO: report amount of connectinos being used
# as per: http://metabroadcast.com/blog/nodejs-moar-connections

to_mb = ( val ) -> (val / 1024 / 1024).toFixed 2

# no sockets on this implementation
sockets = []

module.exports =
  method : 'GET'
  path   : '/stats'
  config: plugins: lout: off
  handler: ( request, reply ) ->

    mem = process.memoryUsage()

    reply
      NODE_ENV : process.env.NODE_ENV
      sockets  : sockets.length
      memory   :
        rss:       to_mb mem.rss
        heapTotal: to_mb mem.heapTotal
        heapUsed:  to_mb mem.heapUsed