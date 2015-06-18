###

Return image files

###

path = require 'path'

module.exports = 

  method: 'GET'
  path  : '/download/{file}'

  handler: ( request, reply ) ->

    root = path.join __dirname, '../../../public/download'

    reply.file root + '/' + request.params.file