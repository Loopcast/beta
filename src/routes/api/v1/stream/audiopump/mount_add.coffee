slug = require 'slug'
Room = schema 'room'

mongoose        = require 'mongoose'
update_metadata = lib 'icecast/update_metadata'

module.exports =
  method: [ 'PUT', 'POST', 'GET' ]
  path   : '/api/v1/stream/audiopump/mount_add'

  config:

    description: "Callback by icecast server when a broadcaster starts streaming"
    tags   : [ "api", "v1" ]

    handler: ( req, reply ) ->

      console.log '- audiopump/mount_add'
      console.log req.payload
      console.log '- - -'

      reply()


# { id: '2f191610-564a-11e5-a647-b34bad0cfa2c',
#   startTime: '2015-09-08T16:53:52.241Z',
#   remoteAddress: '::ffff:82.47.239.207',
#   path: '/loopcast-staging/hems-room',
#   requestHeaders:
#    { 'content-length': '9007199254740992',
#      authorization: 'Basic YW55dXNlcjp4eHg=',
#      'user-agent': 'butt 0.1.14',
#      'content-type': 'audio/mpeg',
#      'ice-name': 'no name',
#      'ice-public': '0',
#      'ice-audio-info': 'ice-bitrate=320;ice-channels=2;ice-samplerate=44100' } } }