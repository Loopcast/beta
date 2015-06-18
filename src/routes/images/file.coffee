###

Return image files

###

path = require 'path'

module.exports = 

  method: 'GET'
  path  : '/images/{file}'

  handler: ( request, reply ) ->

    root = path.join __dirname, '../../../public/images'

    reply.file root + '/' + request.params.file